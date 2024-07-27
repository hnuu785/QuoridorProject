import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				tabBarStyle: {
          backgroundColor: 'transparent', // Set the background color to transparent
          borderTopWidth: 0, // Remove the top border
          elevation: 0, // Remove shadow on Android
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
					href: null,
        }}
      />
			<Tabs.Screen
				name="createName"
				options={{
					href: null,
					title: 'createName',
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="single"
				options={{href: null}}
			/>
			<Tabs.Screen
				name="multi"
				options={{href: null}}
			/>
			<Tabs.Screen
				name="lobby"
				options={{href: null}}
			/>
		</Tabs>
  );
}
