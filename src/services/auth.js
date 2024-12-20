import api from './api';

export const login = async (username, password) => {
    const { licenseKey, machineId } = getLicenseData();
    
    // Validar licencia antes de login
    if (licenseKey && machineId) {
        try {
            await api.post('/license/activate/', { 
                license_key: licenseKey, 
                machine_id: machineId 
            });
        } catch (error) {
            // Si hay error con la licencia, limpiar datos y redirigir
            localStorage.clear();
            throw new Error(error.response?.data?.error || 'Error de licencia');
        }
    }

    const response = await api.post('/auth/login/', { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem('token', access);
    localStorage.setItem('refreshToken', refresh);
    return response.data;
};

export const activateLicense = async (licenseKey, machineId) => {
    return await api.post('/license/activate/', { license_key: licenseKey, machine_id: machineId });
};