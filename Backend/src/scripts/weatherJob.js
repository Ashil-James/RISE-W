import cron from "node-cron";
import { User } from "../models/user.model.js";
import { Broadcast } from "../models/broadcast.model.js";
import { Notification } from "../models/notification.model.js";
import { WeatherEvent } from "../models/weatherEvent.model.js";
import { getForecast, checkHeavyRain, getLocationName } from "../utils/weather.js";
import mongoose from "mongoose";

const checkWeatherAndAlert = async () => {
    console.log("🌦️  Running weather monitoring job...");
    
    try {
        // Gather unique coordinate sets from users who have set their location
        const coordSets = new Map();

        const users = await User.find({ location: { $exists: true } }).select("location");
        for (const u of users) {
            if (u.location?.coordinates) {
                const [lon, lat] = u.location.coordinates;
                const key = `${lon.toFixed(1)},${lat.toFixed(1)}`;
                if (!coordSets.has(key)) {
                    coordSets.set(key, [lon, lat]);
                }
            }
        }

        if (coordSets.size === 0) {
            console.log("🌦️  No user locations found, skipping weather check.");
            return;
        }

        for (const [, [lon, lat]] of coordSets) {
            const forecast = await getForecast(lat, lon);
            if (!forecast) continue;

            const heavyRainExpected = checkHeavyRain(forecast);
            const locationName = await getLocationName(lat, lon);

            // Check for active weather event in this area
            let activeEvent = null;
            try {
                activeEvent = await WeatherEvent.findOne({
                    location: {
                        $nearSphere: {
                            $geometry: { type: "Point", coordinates: [lon, lat] },
                            $maxDistance: 5000,
                        }
                    },
                    isActive: true
                });
            } catch (e) {
                // Fallback: if 2dsphere index causes issues, do a simpler query
                activeEvent = await WeatherEvent.findOne({ isActive: true });
            }

            if (heavyRainExpected) {
                if (!activeEvent) {
                    // ── New storm detected → create event + broadcast + notification ──
                    await WeatherEvent.create({
                        location: { type: "Point", coordinates: [lon, lat] },
                        startTime: new Date(),
                        isActive: true
                    });

                    const systemUser = await User.findOne({ role: "admin" });

                    const alertMessage = `⚠️ Heavy rain expected in ${locationName} in the coming hours. Report any waterlogging or drainage issues immediately.`;

                    await Broadcast.create({
                        type: "SAFETY_ALERT",
                        severity: "High",
                        location: locationName,
                        message: alertMessage,
                        isAuthority: true,
                        createdBy: systemUser?._id || new mongoose.Types.ObjectId()
                    });

                    // Also create a global notification
                    await Notification.create({
                        recipient: null,
                        title: "⚠️ Weather Alert",
                        message: alertMessage,
                        type: "BROADCAST",
                    });

                    console.log(`🚨 Heavy rain alert triggered for ${locationName}`);
                }
            } else if (activeEvent) {
                // ── Storm has passed → end event + trigger survey ──
                activeEvent.isActive = false;
                activeEvent.isSurveyTriggered = true;
                activeEvent.endTime = new Date();
                await activeEvent.save();

                const systemUser = await User.findOne({ role: "admin" });

                const surveyMessage = `☀️ The storm in ${locationName} has passed. Please complete the Post-Storm Survey to report any damages — waterlogging, fallen trees, power outages, or road damage.`;

                await Broadcast.create({
                    type: "SAFETY_ALERT",
                    severity: "Medium",
                    location: locationName,
                    message: surveyMessage,
                    isAuthority: true,
                    createdBy: systemUser?._id || new mongoose.Types.ObjectId()
                });

                await Notification.create({
                    recipient: null,
                    title: "🌧️ Post-Storm Survey Active",
                    message: surveyMessage,
                    type: "BROADCAST",
                });

                console.log(`📋 Post-storm survey triggered for ${locationName}`);
            }
        }
    } catch (error) {
        console.error("Error in weather monitoring job:", error);
    }
};

// Run every 5 minutes for prototype/demo, change to "0 * * * *" for hourly in production
cron.schedule("*/5 * * * *", checkWeatherAndAlert);

export { checkWeatherAndAlert };
