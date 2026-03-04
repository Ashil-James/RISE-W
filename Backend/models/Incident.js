import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    subCategory: {
      type: String,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedAuthority: {
      type: String,
      enum: ["WATER", "ELECTRICITY", "STREET_LIGHT", "CIVIL"],
    },

    status: {
      type: String,
      enum: [
        "OPEN",
        "ACCEPTED",
        "IN_PROGRESS",
        "RESOLVED",
        "VERIFIED",
        "REOPENED",
        "CLOSED",
      ],
      default: "OPEN",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
    },

    image: {
      type: String,
    },

    resolutionImage: {
      type: String,
    },

    authorityMessage: {
      type: String,
    },

    rejectionReason: {
      type: String,
    },

    urgencyScore: {
      type: Number,
      default: 1,
    },

    upvotes: {
      type: Number,
      default: 0,
    },

    verifiedByUser: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

incidentSchema.index({ location: "2dsphere" });

const Incident = mongoose.model("Incident", incidentSchema);

export default Incident;
