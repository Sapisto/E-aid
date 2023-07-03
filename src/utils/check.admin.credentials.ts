export const checkAdminCredentials = (
    email: string,
    password: string
): boolean => {
    // List of admin credentials
    const admins = [
        {
            email: 'eaid@gmail.com',
            fullName: 'eaid',
            phone: '+2349034042761',
            password: 'Eaidsaveslives1!',
        },
    ]

    // Check if the provided email and password match any admin credentials
    return admins.some(
        (admin) => admin.email === email && admin.password === password
    )
}
