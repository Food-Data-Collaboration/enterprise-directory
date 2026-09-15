import { dev } from '$app/env';
import { PosthogAnalytics } from './posthog';
import { LocalAnalytics } from './local';

export interface Analytics {
    track(event: string, properties?: Record<string, unknown>): void;
    identify(userId: string, properties?: Record<string, unknown>): void;
    catch(error: unknown, properties?: Record<string, unknown>): void;
}

export const analytics: Analytics = dev ? new LocalAnalytics() : new PosthogAnalytics(); 
