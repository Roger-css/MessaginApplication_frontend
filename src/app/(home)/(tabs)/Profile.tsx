import { useAuthStore } from "@/src/Store/authStore";
import { Text, View } from "react-native";
import { Button } from "tamagui";

const Profile = () => {
  const logout = useAuthStore((state) => state.logout);
  return (
    <View>
      <Text>Profile</Text>
      <Button onPress={logout}>Logout</Button>
    </View>
  );
};

export default Profile;
