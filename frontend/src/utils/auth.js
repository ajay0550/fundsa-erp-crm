export const getToken = () => {
    return localStorage.getItem("token");
};


export const getUserFromToken = () => {

    const token = getToken();

    if (!token) {
        return null;
    }

    try {

        const payload = token.split(".")[1];

        const decodedPayload = JSON.parse(
            atob(payload)
        );

        return decodedPayload;

    } catch (error) {

        console.error(
            "Failed to decode token",
            error
        );

        return null;
    }
};


export const getUserRole = () => {

    const user = getUserFromToken();

    return user?.role || null;
};


export const hasRole = (...allowedRoles) => {

    const role = getUserRole();

    return allowedRoles.includes(role);
};