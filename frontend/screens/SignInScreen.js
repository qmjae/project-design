import React, { useState } from "react";
import { Alert, View, Text, ScrollView, Dimensions, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../components/auth/FormField";
import CustomButton from "../components/auth/CustomButton";
import { getCurrentUser, signIn } from "../../backend/lib/appwrite";
import { useGlobalContext } from "../../backend/context/GlobalProvider";
import BackgroundWrapper from "../components/common/BackgroundWrapper";

const SignInScreen = ({ navigation }) => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitForm = async () => {

    setIsSubmitting(true);
    
    try {
      await signIn(form.email, form.password);
      const result = await getCurrentUser();
      setUser(result);
      setIsLogged(true);

      navigation.navigate('Home');
    } catch (error) {
      console.log(error);
      Alert.alert('That username and password was incorrect. ', 'Please try again');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <BackgroundWrapper>
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.innerContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/adlaw-v2.png")}
              resizeMode="contain"
              style={styles.logo}
            />
          </View>

          <View style={styles.formFieldContainer}>
            <FormField
              title="Email"
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              otherStyles={styles.formField}
              keyboardType={"email-address"}
            />

            <FormField
              title="Password"
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              otherStyles={styles.formField}
              secureTextEntry
            />
          </View>

          <CustomButton
            title="Sign In"
            handlePress={submitForm} // Call the handleSignIn function
            containerStyles={styles.signInButton}
            isLoading={isSubmitting} // Set to false since there's no logic
          />

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              Don't have an account?
            </Text>
            <Text
              style={styles.signupLink}
              onPress={() => navigation.navigate('SignUp')} // Navigate to SignUp screen
            >
              Sign up
            </Text>
          </View>
        </View>
      </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 16,
    marginVertical: 24,
    minHeight: Dimensions.get("window").height - 100,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  formFieldContainer: {
    marginTop: 28,
    width: '100%',
  },
  signInButton: {
    marginTop: 28,
    width: '100%',
    height: 50,
    justifyContent: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 20,
  },
  signupText: {
    fontSize: 18,
    color: 'gray',
  },
  signupLink: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    marginLeft: 5,
  },
});

export default SignInScreen;
