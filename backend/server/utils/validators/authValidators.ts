/**
 * Checks if a given email is vailed or not
 * @param string - The string to check for vailed email
 * @returns True if the string is vailed email, false if email is invailed
 * @example
 * // Returns true
 * isVailedEmail("prateek@prateekyadu.com")
 * 
 * // Returns false  
 * isVailedEmail("not_vailed_email")
 */

export const isVailedEmail = (email: string) => {
    const regexEmailFormat = /^[a-z0-9]+@+[a-z0-9]+[.]+([a-z]{2,})+$/;
    return regexEmailFormat.test(email);
};


/**
 * Checks if a given password is vailed or not
 * @param string - The string to check for vailed password
 * @returns True if the password is vailed, false if password is invailed
 * @example
 * // Returns true
 * isVailedEmail("TheGoodPassword@413")
 * 
 * // Returns false  
 * isVailedEmail("passwd")
 */

export const isVailedPassword = (password: string) => {
    const regexPasswordFormat = /^.{8,}$/; // minimum length of password is 8
    return regexPasswordFormat.test(password);
};


/**
 * Checks if a given username is vailed or not
 * @param string - The string to check for vailed username
 * @returns True if the username is vailed, false if username is invailed
 * @example
 * // Returns true
 * isVailedEmail("Prateek Yadu")
 * 
 * // Returns false  
 * isVailedEmail("pky")
 */

export const isVailedUsername = (username: string) => {
    const regexUsernameFormat = /^([^0-9]+[a-zA-z ]{3,})$/; // minimum length of username is 4
    return regexUsernameFormat.test(username);
};