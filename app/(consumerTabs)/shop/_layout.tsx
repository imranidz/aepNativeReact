import { Stack } from 'expo-router';

export default function ShopLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="_home/[category]" />
      <Stack.Screen name="_home/[category]/[product]" />
    </Stack>
  );
}
