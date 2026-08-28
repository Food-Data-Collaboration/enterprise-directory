import { posthogAnalytics } from './posthog';

export interface Analytics {
    track(event: string, properties?: Record<string, unknown>): void;
    identify(userId: string, properties?: Record<string, unknown>): void;
    catch(error: unknown, properties?: Record<string, unknown>): void;
}

export const analytics: Analytics = {
    track: (event, properties) =>
        posthogAnalytics.track(event, properties),

    identify: (userId, properties) =>
        posthogAnalytics.identify(userId, properties),

    catch: (error: unknown, properties) =>
        posthogAnalytics.catch(error, properties)
};