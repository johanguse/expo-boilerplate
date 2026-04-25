import { Platform } from "react-native";
import analytics from "@react-native-firebase/analytics";
import crashlytics from "@react-native-firebase/crashlytics";
import perf, { type FirebasePerformanceTypes } from "@react-native-firebase/perf";

const isNative = Platform.OS === "ios" || Platform.OS === "android";

export function initFirebase(): void {
  if (!isNative) return;
  crashlytics().setCrashlyticsCollectionEnabled(!__DEV__);
}

/**
 * Log a non-fatal error; optional key/value context is applied as custom keys
 * (they persist for subsequent events until cleared — use sparingly).
 */
export function logError(
  error: Error,
  context?: Record<string, string>
): void {
  if (!isNative) return;
  if (context) {
    for (const [k, v] of Object.entries(context)) {
      crashlytics().setAttribute(k, v);
    }
  }
  crashlytics().recordError(error);
}

/**
 * Start an HTTP network metric. The caller should `await metric.stop()` (and
 * set response size / code) after the request finishes.
 * On web, returns a no-op metric so callers can `stop()` without branching.
 */
export async function traceHttpRequest(
  url: string,
  method: FirebasePerformanceTypes.HttpMethod
): Promise<FirebasePerformanceTypes.HttpMetric> {
  if (!isNative) {
    return {
      getAttribute: () => null,
      getAttributes: () => ({}),
      putAttribute: () => {
        // no-op
      },
      removeAttribute: () => {
        // no-op
      },
      setHttpResponseCode: () => {
        // no-op
      },
      setRequestPayloadSize: () => {
        // no-op
      },
      setResponseContentType: () => {
        // no-op
      },
      setResponsePayloadSize: () => {
        // no-op
      },
      start: () => Promise.resolve(null),
      stop: () => Promise.resolve(null),
    } as unknown as FirebasePerformanceTypes.HttpMetric;
  }

  const metric = perf().newHttpMetric(url, method);
  await metric.start();
  return metric;
}

type CustomEventParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export const track = {
  screen: (screenName: string) =>
    isNative
      ? analytics().logScreenView({
          screen_name: screenName,
          screen_class: screenName,
        })
      : Promise.resolve(),

  event: (name: string, params?: CustomEventParams) =>
    isNative ? analytics().logEvent(name, params) : Promise.resolve(),

  login: (method: string) =>
    isNative
      ? analytics().logLogin({ method })
      : Promise.resolve(),

  signUp: (method: string) =>
    isNative
      ? analytics().logSignUp({ method })
      : Promise.resolve(),
};
