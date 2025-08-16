import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";
import { useState } from "react";
import { Alert } from "react-native";
import { Avatar, Button, XStack, YStack } from "tamagui";

interface ProfileImagePickerProps {
  currentImage?: string;
  onImageChange: (imageUri: string) => void;
}

export function ProfileImagePicker({
  currentImage,
  onImageChange,
}: ProfileImagePickerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant camera roll permissions to change your profile picture."
      );
      return;
    }

    setIsLoading(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImageChange(result.assets[0].uri);
    }
    setIsLoading(false);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant camera permissions to take a photo."
      );
      return;
    }

    setIsLoading(true);
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      console.log(result.assets[0].uri);
      onImageChange(result.assets[0].uri);
    }
    setIsLoading(false);
  };

  const showImageOptions = () => {
    Alert.alert("Change Profile Picture", "Choose an option", [
      { text: "Camera", onPress: takePhoto },
      { text: "Photo Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };
  return (
    <YStack items="center" gap="$3" bg="$black2" p="$4" rounded={"$2"}>
      <Avatar circular size="$10" bg="$black6">
        <Avatar.Image source={{ uri: currentImage }} />
        <Avatar.Fallback bg={"$red6"} />
      </Avatar>
      <XStack gap="$2">
        <Button
          size="$3"
          variant="outlined"
          icon={Camera}
          onPress={showImageOptions}
          disabled={isLoading}
          bg="$black2"
          borderColor="$black6"
          color="white"
        >
          Change Photo
        </Button>
      </XStack>
    </YStack>
  );
}
