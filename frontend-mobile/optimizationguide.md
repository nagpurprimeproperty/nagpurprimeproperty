Native Mobile App
Performance Optimization Guide
Android • iOS • React Native • Flutter

1. App Architecture
Use Clean Architecture with a clear separation of concerns:
•	UI Layer — Views, components, screens
•	Business Logic Layer — ViewModels, use cases
•	Data Layer — APIs, repositories, local DB
Recommended Patterns:
•	MVVM, Clean Architecture
•	Redux / Zustand / MobX (React Native)
•	Bloc / Riverpod (Flutter)
2. Reduce Re-Renders
Use:
•	React.memo, useMemo, useCallback
Avoid:
•	Inline functions inside render
•	Large state objects
•	Updating parent state unnecessarily
3. Optimize Lists
Large lists are among the biggest performance killers.
Use:
•	FlatList, SectionList (React Native)
•	FlashList, RecyclerListView — for ultra-large datasets
Never use:
•	array.map() for huge datasets
Important FlatList props:
•	removeClippedSubviews, maxToRenderPerBatch, windowSize, initialNumToRender
4. Optimize Images
Images usually consume the most memory.
Best Practices:
•	Use WebP instead of PNG/JPG
•	Compress, lazy load, and cache images
Libraries:
•	react-native-fast-image, Expo Image
Avoid:
•	Full-size images from server, Base64 images
5. API Optimization
Use:
•	Pagination, infinite scroll, debouncing, request caching
•	TanStack Query, SWR, Axios interceptors
Avoid:
•	Calling APIs repeatedly or loading all data at once
6. State Management Optimization
Avoid global state for everything.
Best Practice:
•	Keep local state local, global state minimal
Good options:
•	Zustand, Redux Toolkit, Jotai, MobX
7. Avoid Heavy JS Thread Work
In React Native, blocking the JS thread causes lag and freezes.
Move heavy tasks to:
•	Native modules, background workers, separate threads
Use:
•	Reanimated worklets, Background fetch, InteractionManager
8. Animation Optimization
Use native-driven animations:
•	React Native Reanimated, Gesture Handler
Avoid:
•	JS-driven animations for complex UI
9. Memory Management
Always clean up to avoid memory leaks:
•	clearTimeout(), clearInterval(), unsubscribe(), removeListeners()
Properly dispose of:
•	Camera, Maps, Video players, WebViews
10. Navigation Optimization
Use:
•	Lazy loading screens, Native Stack Navigation (React Navigation)
Avoid:
•	Rendering all tabs/screens together at startup
11. Bundle Size Optimization
•	Remove unused packages, apply tree shaking
•	Use dynamic imports and code splitting
•	Analyze bundle: npx react-native-bundle-visualizer
12. Database Optimization
•	Index frequently searched fields
•	Avoid huge JSON storage, paginate local queries
Recommended DBs:
•	SQLite, Realm, WatermelonDB
13. Startup Time Optimization
•	Avoid heavy API calls on launch
•	Load only critical data, use splash screen wisely
•	Delay non-essential tasks with InteractionManager
14. Performance Monitoring
Tools:
•	Firebase Performance Monitoring, Sentry, Flipper
•	Android Profiler, Xcode Instruments
Track:
•	FPS, Memory, CPU, App crashes, API response time
15. Caching Strategy
Cache:
•	API responses, images, user preferences
Use:
•	AsyncStorage / MMKV, SQLite cache, React Query caching
16. Offline-First Strategy
•	Queue requests offline and sync later
•	Use optimistic UI updates
17. Avoid Overusing WebViews
WebViews are expensive.
•	Prefer Native UI and native screens
•	Use WebView only when absolutely necessary
18. Production Build Optimization
Android:
•	Enable Proguard/R8, enable Hermes Engine
iOS:
•	Enable release optimization, strip debug logs

React Native: Must-Use Stack
Category	Recommendation
UI	React Native + Hermes Engine
State	Zustand / Redux Toolkit
Lists	FlashList
Animation	Reanimated + Gesture Handler
API	React Query (TanStack)
Storage	MMKV
Monitoring	Sentry + Firebase Performance
Forms	React Hook Form
Navigation	Native Stack Navigation

Top Real-World Performance Killers
Fixing these alone improves performance massively:
•	Huge re-renders
•	Unoptimized FlatLists
•	Large/uncompressed images
•	Too much global state
•	Heavy animations on JS thread
•	Bad API design (no pagination/caching)
•	Memory leaks (uncleaned listeners, timers)
•	Too many unnecessary libraries
•	Large bundle size
•	No caching strategy
Backend Optimization Also Matters:
Even a fast frontend feels slow with a bad backend. Optimize: MongoDB indexes, aggregation pipelines, API response size, gzip/brotli compression, CDN, and caching.
