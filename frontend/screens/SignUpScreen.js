import React, { useState } from "react";
import { Alert, View, Text, ScrollView, Dimensions, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../components/auth/FormField";
import CustomButton from "../components/auth/CustomButton";
import { createUser } from '../../backend/lib/appwrite';
import { useGlobalContext } from "../../backend/context/GlobalProvider";

const SignUpScreen = ({ navigation }) => {
  const { setUser, setIsLogged } = useGlobalContext();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);


  const submitForm = async () => {
    if (form.username === "" || form.email === "" || form.password === "") {
      Alert.alert('Missing fields', 'Please fill in all the fields', [{ text: 'OK' }]);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await createUser(form.email, form.password, form.username);
      setUser(result);
      setIsLogged(true);

      Alert.alert('Success', 'Sign up successful');
      navigation.navigate('Home');
    } catch (error) {
      console.log(error);
      Alert.alert('Error', error.message || 'An unexpected error occurred', [{ text: 'OK' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.innerContainer}>
        <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/logo.png")}
              resizeMode="contain"
              style={styles.logo}
            />
          </View>
          <Text style={styles.title}>Sign Up</Text>

          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles={styles.formField}
          />

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

          <CustomButton
            title="Sign Up"
            handlePress={submitForm} // Call the handleSignUp function
            containerStyles={styles.signUpButton}
            isLoading={isSubmitting} 
          />

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>
              Already have an account?
            </Text>
            <Text
              style={styles.signInLink}
              onPress={() => navigation.navigate('SignIn')} // Navigate to SignIn screen
            >
              Sign In
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
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
    width: 120,
    height: 150,
  },
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'stretch',
    color: '#757575',
  },
  formField: {
    marginTop: 28,
    width: '100%',
  },
  signUpButton: {
    marginTop: 20,
    width: '100%',
    height: 50,
    justifyContent: 'center',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 20,
  },
  signInText: {
    fontSize: 18,
    color: 'gray',
  },
  signInLink: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
    marginLeft: 5,
  },
});

export default SignUpScreen;
