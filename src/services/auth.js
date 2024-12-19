import api from './api';

export const login = async (username, password) => {
    const response = await api.post('/auth/login/', { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem('token', access);
    localStorage.setItem('refreshToken', refresh);
    return response.data;
};

export const activateLicense = async (licenseKey, machineId) => {
    return await api.post('/license/activate/', { license_key: licenseKey, machine_id: machineId });
};
