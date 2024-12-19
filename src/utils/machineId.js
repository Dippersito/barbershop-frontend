// src/utils/machineId.js
const STORAGE_KEY = 'BARBERSHOP_MACHINE_ID';
const LICENSE_KEY = 'BARBERSHOP_LICENSE_KEY';

export const getMachineId = () => {
    let machineId = localStorage.getItem(STORAGE_KEY);
    
    if (!machineId) {
        const browserInfo = [
            navigator.userAgent,
            navigator.language,
            new Date().getTimezoneOffset(),
            window.innerWidth,
            window.innerHeight,
            window.location.hostname
        ].join('|');
        
        let hash = 0;
        for (let i = 0; i < browserInfo.length; i++) {
            const char = browserInfo.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        
        const timestamp = new Date().getTime();
        machineId = `BARBERSHOP-${Math.abs(hash)}-${timestamp}`;
        
        localStorage.setItem(STORAGE_KEY, machineId);
    }
    
    return machineId;
};

export const saveLicenseData = (licenseKey) => {
    localStorage.setItem(LICENSE_KEY, licenseKey);
    const machineId = getMachineId();
    return { licenseKey, machineId };
};

export const getLicenseData = () => {
    const licenseKey = localStorage.getItem(LICENSE_KEY);
    const machineId = localStorage.getItem(STORAGE_KEY);
    return { licenseKey, machineId };
};

export const clearLicenseData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LICENSE_KEY);
};