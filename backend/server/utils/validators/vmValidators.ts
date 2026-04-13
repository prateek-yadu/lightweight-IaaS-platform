
export const validateVMName = (vmName: string) => {
    const regexNameFormat = /^[A-Za-z0-9]([a-zA-Z0-9-.])*[A-Za-z0-9]$/; // vailed name eg db-prod-01 or databse.prateeklabs.inc
    return vmName.length >= 4 && regexNameFormat.test(vmName); // vm name should be >= 4 characters 
};