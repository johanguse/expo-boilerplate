# Welcome to Expo Boilerplate with Uniwind and HeroUI 🚀

This is an [Expo](https://expo.dev) boilerplate project with **Uniwind** (Tailwind CSS v4) and **HeroUI Native** pre-configured for rapid React Native development.

## 🎯 Features

- ✅ **Expo Router** - File-based routing
- ✅ **Uniwind** - Tailwind CSS v4 for React Native
- ✅ **HeroUI Native** - Beautiful UI component library
- ✅ **TypeScript** - Type-safe development
- ✅ **Authentication Flow** - Pre-built login/signup screens
- ✅ **Tab Navigation** - Ready-to-use tab-based navigation
- ✅ **Modern Styling** - Glassmorphism, gradients, and animations

## 📦 Create a New Project

Create a new project using this template:

```bash
# Using npx
npx create-expo-app@latest --template https://github.com/sanketpipaliya208/expo_boilerplat_uniwind_heroui

# Using yarn
yarn create expo-app --template https://github.com/sanketpipaliya208/expo_boilerplat_uniwind_heroui

# Using bun
bun create expo --template https://github.com/sanketpipaliya208/expo_boilerplat_uniwind_heroui
```

## 🚀 Get Started

1. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

2. **Start the development server**

   ```bash
   npx expo start
   ```

3. **Run on your device**

   In the output, you'll find options to open the app in:
   - [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
   - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - [Expo Go](https://expo.dev/go) (limited sandbox)

## 📁 Project Structure

```
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Tab navigation screens
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable components
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions and services
│   └── constants/        # App constants
└── global.css            # Global Tailwind styles
```

## 🎨 Styling

This boilerplate uses **Uniwind** for styling with Tailwind CSS v4. Style your components using Tailwind classes:

```tsx
<View className="flex-1 bg-gradient-to-br from-purple-500 to-pink-500">
  <Text className="text-white text-2xl font-bold">Hello World</Text>
</View>
```

## 🧩 UI Components

HeroUI Native components are available throughout the project:

```tsx
import { Button, Input, Card } from "@heroui/native";

<Button color="primary" onPress={() => {}}>
  Click Me
</Button>;
```

## 📚 Learn More

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Uniwind Documentation](https://www.npmjs.com/package/uniwind)
- [HeroUI Native](https://heroui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is open source and available under the MIT License.
