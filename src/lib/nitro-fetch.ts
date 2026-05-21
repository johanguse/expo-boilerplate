import { fetch } from "react-native-nitro-fetch";

// Replace the global fetch with the native-backed nitro implementation.
// URLSession on iOS, OkHttp on Android — faster than the JS bridge polyfill.
// Must be imported before any code that calls fetch().
globalThis.fetch = fetch as unknown as typeof globalThis.fetch;
