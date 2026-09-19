export {};

declare global {
	interface Window {
		/** Injected by FiveM's CEF runtime; absent in a normal browser. */
		invokeNative?: unknown;
		/** Returns the name of the resource hosting this NUI frame. */
		GetParentResourceName?: () => string;
	}
}
