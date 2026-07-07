Mobile App Performance
Optimization Guide
With Code Examples & Explanations
React Native  •  Android  •  iOS  •  Flutter

 
1. App Architecture
💡 Clean Architecture separates your app into independent layers. Each layer has one job. This prevents UI from knowing about database logic and vice versa, avoids unnecessary re-renders, and makes the app testable and scalable.

Layer Structure
•	UI Layer — Screens, components, what the user sees
•	Business Logic Layer — ViewModels, use cases, rules
•	Data Layer — APIs, local DB, repositories

MVVM Pattern (React Native)
💡 Model-View-ViewModel keeps UI dumb. The ViewModel fetches and transforms data; the View just renders it. When data changes, only the affected component re-renders, not the entire tree.

// ── DATA LAYER ──────────────────────────────
// userRepository.ts
export const fetchUser = async (id: string) => {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
};
 
// ── BUSINESS LOGIC (ViewModel) ───────────────
// useUserViewModel.ts
import { useQuery } from '@tanstack/react-query';
import { fetchUser } from './userRepository';
 
export const useUserViewModel = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
  });
  return { user: data, isLoading, error };
};
 
// ── UI LAYER ────────────────────────────────
// UserScreen.tsx  (knows nothing about fetch/DB)
const UserScreen = ({ userId }: { userId: string }) => {
  const { user, isLoading } = useUserViewModel(userId);
  if (isLoading) return <Spinner />;
  return <Text>{user?.name}</Text>;
};


2. Reduce Re-Renders
💡 Every re-render costs CPU time. In React Native, unnecessary re-renders are the #1 cause of janky UI. The goal: only re-render a component when its own data actually changed.

React.memo — Skip re-render if props didn't change
💡 Without memo, a child re-renders every time the parent re-renders, even if the child's props are identical. React.memo compares props shallowly and skips the render if nothing changed.
// ❌ BAD — re-renders on every parent update
const UserCard = ({ name, age }) => (
  <View><Text>{name} - {age}</Text></View>
);
 
// ✅ GOOD — skips re-render if name & age unchanged
const UserCard = React.memo(({ name, age }) => (
  <View><Text>{name} - {age}</Text></View>
));

useMemo — Cache expensive calculations
💡 useMemo runs the function only when dependencies change. Use it for heavy computations (sorting, filtering large arrays) that you don't want to repeat on every render.
// ❌ BAD — recalculates on every render
const sorted = data.sort((a, b) => b.score - a.score);
 
// ✅ GOOD — recalculates only when 'data' changes
const sorted = useMemo(
  () => [...data].sort((a, b) => b.score - a.score),
  [data]
);

useCallback — Stable function references
💡 Functions defined inside a component are recreated every render. If you pass them as props, child components see a 'new' function each time and re-render. useCallback returns the same function instance between renders.
// ❌ BAD — new function reference every render
const handlePress = () => { doSomething(id); };
 
// ✅ GOOD — same reference until 'id' changes
const handlePress = useCallback(() => {
  doSomething(id);
}, [id]);
 
// ❌ BAD — inline function creates new ref every render
<Button onPress={() => handlePress(item.id)} />
 
// ✅ GOOD — stable reference
<Button onPress={handlePress} />


3. Optimize Lists
💡 Rendering 500 items at once means 500 components in memory. FlatList renders only what's visible on screen plus a small buffer. Scrolling loads more lazily. This is called 'windowing' or 'virtualization'.

FlatList — Virtualized list
// ❌ BAD — renders ALL 1000 items at once
{users.map(user => <UserCard key={user.id} user={user} />)}
 
// ✅ GOOD — renders only visible items
<FlatList
  data={users}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <UserCard user={item} />}
  // Performance props:
  removeClippedSubviews={true}   // unmount off-screen items
  maxToRenderPerBatch={10}        // items rendered per scroll batch
  windowSize={5}                  // render window = 5 * screen height
  initialNumToRender={10}         // items rendered on first load
  getItemLayout={(_, index) => ({ // skip dynamic measurement
    length: 80, offset: 80 * index, index
  })}
/>

FlashList — 10x faster than FlatList
💡 FlashList by Shopify recycles item components (like Android RecyclerView) instead of creating new ones. For lists of 100+ items, it's dramatically faster.
import { FlashList } from '@shopify/flash-list';
 
<FlashList
  data={users}
  renderItem={({ item }) => <UserCard user={item} />}
  estimatedItemSize={80}   // required: estimated item height
  keyExtractor={(item) => item.id}
/>


4. Optimize Images
💡 Images are usually the biggest memory hog. A 4K image loaded for a 100x100 thumbnail wastes 95% of memory. Optimize format, size, and loading strategy.

Use WebP format
💡 WebP is 25-35% smaller than PNG/JPG at same quality. Supported on both Android and iOS.
// On your server/CDN — serve WebP
// Example: Cloudinary auto-format
const imageUrl = `https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/photo`;
// f_auto → serves WebP to supported browsers/apps
// q_auto → auto compression quality

react-native-fast-image — Caching + Performance
💡 The default <Image> component re-downloads images on every mount. FastImage caches aggressively and supports priority loading.
import FastImage from 'react-native-fast-image';
 
<FastImage
  style={{ width: 100, height: 100 }}
  source={{
    uri: 'https://example.com/avatar.webp',
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable, // cache forever
  }}
  resizeMode={FastImage.resizeMode.cover}
/>
 
// Preload images before they're needed
FastImage.preload([
  { uri: 'https://example.com/banner.webp' },
]);

Avoid Base64 images
// ❌ BAD — inflates JS bundle, no caching
<Image source={{ uri: 'data:image/png;base64,iVBORw0KGgo...' }} />
 
// ✅ GOOD — URL-based, cacheable
<Image source={{ uri: 'https://cdn.example.com/photo.webp' }} />


5. API Optimization
💡 Most apps are slow because they fetch too much data, too often, with no caching. Fix: fetch less, cache results, and debounce user-triggered requests.

React Query — Caching + Deduplication
💡 React Query automatically caches API results. If two components request the same data, only one network call is made. Stale data shows instantly while a background refresh runs.
import { useQuery, useMutation } from '@tanstack/react-query';
 
// ✅ Cached GET — won't re-fetch for 5 minutes
const { data: users } = useQuery({
  queryKey: ['users'],
  queryFn: () => fetch('/api/users').then(r => r.json()),
  staleTime: 5 * 60 * 1000,   // 5 minutes
  gcTime: 10 * 60 * 1000,     // keep in cache 10 minutes
});
 
// ✅ POST with cache invalidation
const mutation = useMutation({
  mutationFn: (newUser) => fetch('/api/users', {
    method: 'POST', body: JSON.stringify(newUser)
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});

Pagination — Don't load all data
// ✅ Infinite scroll with React Query
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 1 }) =>
    fetch(`/api/posts?page=${pageParam}&limit=20`).then(r => r.json()),
  getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
});
 
<FlatList
  data={data?.pages.flatMap(p => p.items)}
  onEndReached={() => hasNextPage && fetchNextPage()}
  onEndReachedThreshold={0.5}
  renderItem={({ item }) => <PostCard post={item} />}
/>

Debounce Search — Prevent API flood
💡 Without debounce, typing 'hello' fires 5 API calls. With 300ms debounce, only 1 call fires after the user stops typing.
import { useState, useEffect } from 'react';
 
const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
 
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);  // cancel on next keystroke
  }, [query]);
 
  const { data } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchAPI(debouncedQuery),
    enabled: debouncedQuery.length > 2,  // min 3 chars
  });
 
  return <TextInput onChangeText={setQuery} value={query} />;
};


6. State Management Optimization
💡 Putting everything in global state means any state change re-renders your whole component tree. Keep state as close to where it's used as possible.

Zustand — Lightweight global state
💡 Zustand only re-renders components that subscribe to the specific slice of state that changed. Unlike Context API, changing one field doesn't re-render all consumers.
import { create } from 'zustand';
 
// Define store
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
 
// ✅ Only re-renders when 'user' changes
const Header = () => {
  const user = useAuthStore((state) => state.user); // selector
  return <Text>{user?.name}</Text>;
};
 
// ❌ BAD — re-renders on ANY store change
const user = useAuthStore(); // subscribes to entire store

Keep local state local
// ❌ BAD — modal open state in global store
const useStore = create((set) => ({
  isModalOpen: false,   // nobody else needs this!
  setModalOpen: (v) => set({ isModalOpen: v }),
}));
 
// ✅ GOOD — local state for local concerns
const MyScreen = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <Button onPress={() => setIsModalOpen(true)} />
      <Modal visible={isModalOpen} />
    </>
  );
};


7. Avoid Heavy JS Thread Work
💡 React Native has a single JS thread. If you run heavy logic (sorting 10k items, parsing huge JSON) on it, animations stutter and UI freezes. Move heavy work off the JS thread.

InteractionManager — Defer work until after animation
💡 InteractionManager.runAfterInteractions delays your heavy task until all animations and transitions are complete, keeping the UI smooth.
import { InteractionManager } from 'react-native';
 
useEffect(() => {
  // ❌ BAD — runs immediately, may block transition animation
  // loadHeavyData();
 
  // ✅ GOOD — waits for screen transition to finish
  const task = InteractionManager.runAfterInteractions(() => {
    loadHeavyData();
  });
  return () => task.cancel();
}, []);

Reanimated Worklets — Run on UI thread
💡 Worklets are functions that run on the UI thread (not JS thread). Animations and gesture calculations in worklets never stutter, even if JS thread is busy.
import Animated, { useSharedValue,
  useAnimatedStyle, withSpring } from 'react-native-reanimated';
 
const MyComponent = () => {
  const offset = useSharedValue(0);
 
  // 'worklet' runs on UI thread — never blocks JS
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return { transform: [{ translateX: offset.value }] };
  });
 
  return (
    <Animated.View style={animatedStyle}>
      <Text>Smooth!</Text>
    </Animated.View>
  );
};


8. Animation Optimization
💡 JS-driven animations (Animated API with useNativeDriver: false) communicate across the JS-UI bridge every frame — 60 messages per second. Native-driven animations run entirely on the UI thread with zero bridge overhead.

Always use useNativeDriver: true
import { Animated } from 'react-native';
 
// ❌ BAD — JS thread drives every frame
Animated.timing(opacity, {
  toValue: 1,
  duration: 300,
  useNativeDriver: false,  // crosses bridge 60x/sec
}).start();
 
// ✅ GOOD — UI thread handles it, JS thread free
Animated.timing(opacity, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true,   // no bridge overhead
}).start();
 
// Note: useNativeDriver: true only works for:
// opacity, transform (translateX, rotate, scale)
// NOT for width, height, backgroundColor

Reanimated 3 — Full native animation
import { useSharedValue, withTiming,
  withSpring, withRepeat } from 'react-native-reanimated';
 
// Spring animation
const scale = useSharedValue(1);
const onPress = () => {
  scale.value = withSpring(1.2, { damping: 10 });
};
 
// Looping animation
const rotation = useSharedValue(0);
rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1);
 
const style = useAnimatedStyle(() => ({
  transform: [
    { scale: scale.value },
    { rotate: `${rotation.value}deg` },
  ],
}));


9. Memory Management
💡 Memory leaks happen when you set state or run callbacks on unmounted components. Common culprits: timers, event listeners, subscriptions, and async calls that finish after the component is gone.

Cleanup with useEffect return
useEffect(() => {
  // 1. Timers
  const timer = setTimeout(() => doSomething(), 2000);
 
  // 2. Intervals
  const interval = setInterval(() => pollData(), 5000);
 
  // 3. Event listeners
  const subscription = AppState.addEventListener('change', handler);
 
  // 4. Custom event emitters
  const emitter = eventEmitter.addListener('event', handler);
 
  // ✅ Always return cleanup function
  return () => {
    clearTimeout(timer);
    clearInterval(interval);
    subscription.remove();
    emitter.remove();
  };
}, []);

Cancel async operations on unmount
useEffect(() => {
  let isMounted = true;
 
  const loadData = async () => {
    const result = await fetchUsers();
    // ✅ Check before setting state
    if (isMounted) setUsers(result);
  };
 
  loadData();
  return () => { isMounted = false; }; // cleanup
}, []);
 
// Or use AbortController for fetch:
useEffect(() => {
  const controller = new AbortController();
  fetch('/api/data', { signal: controller.signal })
    .then(r => r.json()).then(setData);
  return () => controller.abort();
}, []);


10. Navigation Optimization
💡 Native Stack Navigator uses actual native navigation controllers (UINavigationController on iOS, Fragment on Android). JS-based navigators simulate navigation in JavaScript — much slower and heavier.

Native Stack — Use native controllers
import { createNativeStackNavigator }
  from '@react-navigation/native-stack';
 
// ✅ GOOD — uses native iOS/Android navigation
const Stack = createNativeStackNavigator();
 
// ❌ SLOWER — JS-based stack
// import { createStackNavigator } from '@react-navigation/stack';
 
const App = () => (
  <Stack.Navigator
    screenOptions={{
      animation: 'slide_from_right', // native animation
      headerShown: false,
    }}
  >
    <Stack.Screen name='Home' component={HomeScreen} />
    <Stack.Screen name='Profile' component={ProfileScreen} />
  </Stack.Navigator>
);

Lazy load tab screens
💡 By default, all tab screens mount when the app opens — even if the user never visits them. Lazy loading mounts a screen only when first visited.
import { createBottomTabNavigator }
  from '@react-navigation/bottom-tabs';
 
const Tab = createBottomTabNavigator();
 
<Tab.Navigator
  screenOptions={{
    lazy: true,  // ✅ mount screens only when visited
    unmountOnBlur: false, // keep state after first visit
  }}
>
  <Tab.Screen name='Home' component={HomeScreen} />
  <Tab.Screen name='Feed' component={FeedScreen} />
  <Tab.Screen name='Profile' component={ProfileScreen} />
</Tab.Navigator>


11. Bundle Size Optimization
💡 A large JS bundle = slow startup. Every extra library you install adds to the bundle. Import only what you need.

Import only what you use
// ❌ BAD — imports entire lodash (~70KB)
import _ from 'lodash';
const result = _.cloneDeep(obj);
 
// ✅ GOOD — imports only cloneDeep (~5KB)
import cloneDeep from 'lodash/cloneDeep';
const result = cloneDeep(obj);
 
// ❌ BAD — imports all icons
import { Icon1, Icon2 } from 'react-native-vector-icons';
 
// ✅ GOOD — import from specific set
import Icon from 'react-native-vector-icons/Ionicons';

Analyze your bundle
# See what's making your bundle fat
npx react-native-bundle-visualizer
 
# Check bundle size
npx react-native bundle \
  --platform android \
  --dev false \
  --entry-file index.js \
  --bundle-output /tmp/bundle.js
 
ls -lh /tmp/bundle.js   # check final size


12. Database Optimization
💡 Slow queries on a local DB cause the same jank as slow network calls. Index your data and avoid loading everything at once.

WatermelonDB — Reactive, lazy-loaded local DB
import { appSchema, tableSchema } from '@nozbe/watermelondb';
 
// Define schema with index
const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'posts',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'user_id', type: 'string', isIndexed: true }, // ✅ indexed
        { name: 'created_at', type: 'number', isIndexed: true },
      ],
    }),
  ],
});
 
// Query with pagination — don't fetch all 10,000 posts
const posts = await database
  .get('posts')
  .query(
    Q.where('user_id', userId),
    Q.sortBy('created_at', Q.desc),
    Q.take(20),   // ✅ limit results
    Q.skip(page * 20),
  ).fetch();

MMKV — Fast key-value storage
💡 MMKV is 30x faster than AsyncStorage for simple key-value reads/writes. Use it for user preferences, tokens, cached values.
import { MMKV } from 'react-native-mmkv';
const storage = new MMKV();
 
// ✅ Synchronous, 30x faster than AsyncStorage
storage.set('user.token', 'abc123');
const token = storage.getString('user.token');
 
// ❌ AsyncStorage — async, slow, JSON-only
// await AsyncStorage.setItem('token', 'abc123');


13. Startup Time Optimization
💡 Users make a judgment about your app in the first 2 seconds. Slow startup kills retention. Load only what's needed to show the first screen.

Defer non-critical work
// App.tsx
const App = () => {
  useEffect(() => {
    // ❌ BAD — heavy setup blocks initial render
    // initAnalytics();
    // prefetchAllData();
    // setupCrashReporting();
 
    // ✅ GOOD — defer until after first render
    InteractionManager.runAfterInteractions(() => {
      initAnalytics();
      setupCrashReporting();
      prefetchSecondaryData();
    });
  }, []);
 
  return <NavigationContainer>...</NavigationContainer>;
};

Load only critical data on launch
// ✅ On launch: load auth token only (fast, local)
const bootstrap = async () => {
  const token = storage.getString('auth.token'); // MMKV — sync
  if (token) {
    store.setToken(token);
    navigate('Home');  // show home immediately
  } else {
    navigate('Login');
  }
  // Fetch user profile AFTER showing screen
  // (not blocking the navigation)
};


14. Performance Monitoring
💡 You can't optimize what you don't measure. Add monitoring to catch real issues from real users, not just your test device.

Sentry — Error + Performance tracking
import * as Sentry from '@sentry/react-native';
 
// Initialize once at app start
Sentry.init({
  dsn: 'https://your-dsn@sentry.io/project-id',
  tracesSampleRate: 0.2,  // track 20% of transactions
  enableAutoPerformanceTracing: true,
});
 
// Track custom performance
const transaction = Sentry.startTransaction({
  name: 'loadUserProfile',
});
await fetchUserProfile(userId);
transaction.finish();
 
// Wrap root component
export default Sentry.wrap(App);

Flipper — Dev-time debugging
// Flipper works automatically in debug builds
// No code needed — just install Flipper desktop app
 
// Available plugins:
// - Network inspector (see all API calls)
// - React DevTools (inspect component tree)
// - Layout inspector (view hierarchy)
// - Performance monitor (FPS, CPU, memory)
// - Async Storage viewer
// - MMKV viewer
 
// Add to android/app/build.gradle:
// debugImplementation('com.facebook.flipper:flipper:...')


15. Caching Strategy
💡 Every network call has latency. Cache aggressively so repeat visits feel instant. Show cached data immediately, then refresh in background.

Stale-While-Revalidate pattern
// React Query implements stale-while-revalidate natively
const { data } = useQuery({
  queryKey: ['dashboard'],
  queryFn: fetchDashboard,
  staleTime: 60_000,   // show cached for 60s before refetch
  gcTime: 300_000,     // keep in memory 5 minutes
  refetchOnWindowFocus: true,  // refresh when user comes back
  placeholderData: keepPreviousData, // no loading flash on refetch
});
 
// Result: user sees data instantly,
// fresh data arrives silently in background

Persist cache to disk
import { MMKV } from 'react-native-mmkv';
import { createSyncStoragePersister }
  from '@tanstack/query-sync-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
 
const mmkvStorage = new MMKV();
const persister = createSyncStoragePersister({
  storage: {
    getItem: (key) => mmkvStorage.getString(key) ?? null,
    setItem: (key, value) => mmkvStorage.set(key, value),
    removeItem: (key) => mmkvStorage.delete(key),
  },
});
 
// Cache survives app restarts
persistQueryClient({ queryClient, persister,
  maxAge: 24 * 60 * 60 * 1000 });  // 24 hours


16. Offline-First Strategy
💡 Don't show an error screen when there's no internet. Queue the action and sync when connectivity returns. Show optimistic results immediately.

Optimistic UI updates
💡 Show the result of an action immediately (optimistically), then confirm or roll back when the server responds.
const likeMutation = useMutation({
  mutationFn: (postId) => likePost(postId),
 
  // ✅ Update UI immediately, before server responds
  onMutate: async (postId) => {
    await queryClient.cancelQueries({ queryKey: ['posts'] });
    const previous = queryClient.getQueryData(['posts']);
 
    queryClient.setQueryData(['posts'], (old) =>
      old.map(p => p.id === postId
        ? { ...p, likes: p.likes + 1, isLiked: true }
        : p
      )
    );
    return { previous };  // save for rollback
  },
 
  // ❌ If server fails, roll back
  onError: (err, _, ctx) => {
    queryClient.setQueryData(['posts'], ctx.previous);
  },
});

Queue requests when offline
import NetInfo from '@react-native-community/netinfo';
 
const offlineQueue = [];
 
const makeRequest = async (request) => {
  const { isConnected } = await NetInfo.fetch();
 
  if (!isConnected) {
    offlineQueue.push(request);  // save for later
    return;
  }
  return executeRequest(request);
};
 
// Sync when back online
NetInfo.addEventListener((state) => {
  if (state.isConnected && offlineQueue.length > 0) {
    const pending = [...offlineQueue];
    offlineQueue.length = 0;
    pending.forEach(executeRequest);
  }
});


17. Avoid Overusing WebViews
💡 A WebView is a full browser engine embedded in your app. It adds 20-40MB to memory and has slow startup. Use native components instead whenever possible.

When WebView is unavoidable — optimize it
import { WebView } from 'react-native-webview';
 
// ✅ Load only when visible (lazy)
const [showWebView, setShowWebView] = useState(false);
 
<Button onPress={() => setShowWebView(true)} title='Open' />
{showWebView && (
  <WebView
    source={{ uri: 'https://docs.example.com' }}
    // ✅ Performance settings
    cacheEnabled={true}
    cacheMode='LOAD_CACHE_ELSE_NETWORK'
    javaScriptEnabled={true}
    domStorageEnabled={true}
    // ✅ Preload in background when not visible yet
    renderLoading={() => <Spinner />}
    startInLoadingState={true}
  />
)}
 
// ✅ Better alternative: render HTML natively
// Use: react-native-render-html
import RenderHtml from 'react-native-render-html';
<RenderHtml source={{ html: '<b>Hello</b>' }} />


18. Production Build Optimization
💡 Debug builds are huge and slow — they include logs, source maps, and dev tools. Production builds strip all of that and add compiler optimizations.

Enable Hermes (React Native)
💡 Hermes is a JavaScript engine built by Meta specifically for React Native. It pre-compiles JS to bytecode at build time, reducing startup time by 30-50%.
// android/app/build.gradle
project.ext.react = [
  enableHermes: true,  // ✅ Enable Hermes
]
 
// ios/Podfile
:hermes_enabled => true  // ✅ Enable Hermes on iOS
 
// Verify Hermes is running:
const isHermes = () => !!global.HermesInternal;
console.log('Hermes enabled:', isHermes());

Enable Proguard/R8 (Android)
💡 Proguard removes unused code and renames classes to single characters, reducing APK size by 30-60%. R8 does this plus additional optimizations.
// android/app/build.gradle
android {
  buildTypes {
    release {
      minifyEnabled true        // ✅ Enable R8/Proguard
      shrinkResources true      // ✅ Remove unused resources
      proguardFiles getDefaultProguardFile(
        'proguard-android-optimize.txt'  // ✅ use optimize variant
      ), 'proguard-rules.pro'
    }
  }
}

Strip logs in production
// babel.config.js
module.exports = {
  plugins: [
    // ✅ Remove all console.log in production
    ...(process.env.NODE_ENV === 'production'
      ? [['transform-remove-console', { exclude: ['error', 'warn'] }]]
      : []),
  ],
};


Quick Reference Summary
#	Area	Use	Avoid
1	Architecture	Clean Architecture, MVVM	Mixed responsibilities
2	Re-renders	React.memo, useMemo, useCallback	Inline functions in JSX
3	Lists	FlashList, FlatList props	array.map() for large data
4	Images	WebP, FastImage, caching	Base64, uncompressed images
5	API	React Query, pagination, debounce	Fetch-on-every-render
6	State	Zustand selectors, local state	Everything in global store
7	JS Thread	InteractionManager, worklets	Heavy sync work on load
8	Animations	Reanimated, useNativeDriver: true	JS-driven animations
9	Memory	Cleanup in useEffect return	Unremoved listeners/timers
10	Navigation	Native Stack, lazy tabs	JS Stack, mount all tabs
11	Bundle	Selective imports, tree shaking	Import entire libraries
12	Database	MMKV, WatermelonDB, indexes	AsyncStorage, no indexes
13	Startup	Defer non-critical work	Heavy calls on app launch
14	Monitoring	Sentry, Flipper, Firebase	Ship without monitoring
15	Caching	staleTime, persist to disk	Fetch same data repeatedly
16	Offline	Optimistic UI, queue requests	Show error, block user
17	WebViews	Native HTML renderer	WebView for simple HTML
18	Production	Hermes, R8, strip logs	Debug build in production

