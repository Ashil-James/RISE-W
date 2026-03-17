import React from "react";
import AuthorityIncidentCase from "../../components/authority/AuthorityIncidentCase";

const AuthorityPowerCase = () => (
    <AuthorityIncidentCase
        authorityPath="power"
        tone="amber"
        reportPrefix="POW"
        defaultCategory="Power Issue"
        portalLabel="Grid Response Coordination Online"
        criticalNotice="Emergency Power Backup Isolation Required"
        affectedUsersMultiplier={6}
        affectedUsersFallback={60}
    />
);

export default AuthorityPowerCase;
