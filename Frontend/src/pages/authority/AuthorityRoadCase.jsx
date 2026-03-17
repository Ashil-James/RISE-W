import React from "react";
import AuthorityIncidentCase from "../../components/authority/AuthorityIncidentCase";

const AuthorityRoadCase = () => (
    <AuthorityIncidentCase
        authorityPath="road"
        tone="orange"
        reportPrefix="ROA"
        defaultCategory="Infrastructure"
        portalLabel="Operational Status Online"
        criticalNotice="Accident Hazard - Immediate Repair Required"
        affectedUsersMultiplier={4}
        affectedUsersFallback={40}
    />
);

export default AuthorityRoadCase;
