import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const colors = {
  primary: '#76c0df',     // Primary blue color
  secondary: '#FFD700',   // Gold color for highlights
  text: {
    dark: '#333',
    medium: '#666',
    light: '#999',
  },
  background: {
    main: 'transparent',
    white: '#fff',
    lightGray: '#f0f0f0',
    card: '#ffffff',
  },
  border: '#e0e0e0',
  success: '#4CAF50',
  warning: '#FFCC00',
  danger: '#990000',
  shadow: '#000',
};

export const spacing = {
  xs: 5,
  s: 8,
  m: 15,
  l: 20,
  xl: 25,
  xxl: 35,
};

export const fontSizes = {
  xs: 12,
  s: 14,
  m: 16,
  l: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  title: 48,
};

export const borderRadius = {
  s: 5,
  m: 8,
  l: 10,
  xl: 15,
  circle: 9999,
};

export const shadows = {
  light: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  strong: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const globalStyles = StyleSheet.create({
  // Container styles
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.main,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
    paddingBottom: 65, // Space for bottom navigation
  },
  contentContainer: {
    flex: 1,
    padding: spacing.l,
  },
  
  // Card styles
  card: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.m,
    padding: spacing.m,
    marginBottom: spacing.m,
    ...shadows.light,
  },
  
  // Text styles
  title: {
    fontSize: fontSizes.xxxl,
    fontWeight: 'bold',
    color: colors.text.dark,
  },
  subtitle: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.text.dark,
  },
  highlightText: {
    color: colors.secondary,
    fontWeight: 'bold',
  },
  bodyText: {
    fontSize: fontSizes.m,
    color: colors.text.medium,
    lineHeight: 24,
  },
  
  // Form styles
  input: {
    height: 50,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.s,
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
  },
  
  // Button styles
  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.s,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.light,
  },
  buttonSecondary: {
    backgroundColor: colors.background.white,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.s,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.background.white,
    fontSize: fontSizes.m,
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    color: colors.primary,
    fontSize: fontSizes.m,
    fontWeight: 'bold',
  },
  
  // Image styles
  image: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.m,
    marginBottom: spacing.m,
  },
  
  // Header styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  headerTitle: {
    fontSize: fontSizes.xxxl,
    fontWeight: '500',
    color: colors.secondary,
    textAlign: 'center',
    flex: 1,
  },
  headerIconContainer: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  
  // Bottom navigation
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.background.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 65,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    ...shadows.medium,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  activeNavItem: {
    borderTopWidth: 3,
    borderTopColor: colors.primary,
    paddingTop: 3,
  },
  
  // List styles
  list: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 20,
  },
  
  // Utility styles
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});