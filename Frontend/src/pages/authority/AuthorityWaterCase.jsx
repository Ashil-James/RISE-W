import React from "react";
import AuthorityIncidentCase from "../../components/authority/AuthorityIncidentCase";

const AuthorityWaterCase = () => (
    <AuthorityIncidentCase
        authorityPath="water"
        tone="sky"
        reportPrefix="REQ"
        defaultCategory="Water Supply"
        portalLabel="Case Monitoring System Active"
        criticalNotice="Critical Resource Allocation Recommended"
        affectedUsersMultiplier={5}
        affectedUsersFallback={50}
    />
);

export default AuthorityWaterCase;
