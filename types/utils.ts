export const Base64 = {
    encode: (input: string): string => {
        return btoa(input);
    },
    decode: (input: string): string => {
        return atob(input);
    }
}