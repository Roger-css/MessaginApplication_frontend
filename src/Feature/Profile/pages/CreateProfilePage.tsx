import { useAuthStore } from "@/src/Store/authStore";
import { tamaguiConfig } from "@/tamagui.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Save } from "lucide-react-native";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform } from "react-native";
import { Button, ScrollView, Text, YStack } from "tamagui";
import { Toast } from "toastify-react-native";
import { ProfileImagePicker } from "../components/ImagePicker";
import { ProfileFormField } from "../components/ProfileFormField";
import { useCreateProfile } from "../hooks/useCreateProfile";
import { profileSchema, type ProfileFormData } from "../utils/SchemaValidation";
export function EditProfileScreen() {
  const initialValues: ProfileFormData = {
    name: "",
    username: undefined,
    bio: undefined,
    profileImageUri: undefined,
  };
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialValues,
  });
  const profileImageUri = watch("profileImageUri");

  const authenticate = useAuthStore((state) => state.setAuth);
  const { createProfile } = useCreateProfile();
  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await createProfile(data);
      const { result, refreshToken, error, token } = response;
      if (!result) {
        error?.forEach((er) => Toast.error(er));
        return;
      }
      authenticate({ access: token!, refresh: refreshToken! });
      router.replace("/(home)/Index");
    } catch {
      Toast.error("Make sure you are connected to the internet");
    }
  };
  const handleImageChange = (imageUri: string) => {
    setValue("profileImageUri", imageUri, { shouldDirty: true });
  };
  const $black2 = tamaguiConfig.themes.dark.black2.val;
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: $black2 }}
      behavior={Platform.OS ? "padding" : "height"}
    >
      <ScrollView style={{ flex: 1, height: "100%" }} bg={"$black2"}>
        <YStack gap="$4" p="$4" bg="$black2" minH="100%">
          {/* Header */}
          <YStack gap="$2" items="center" pt="$6">
            <Text fontSize="$8" fontWeight="bold" color="white">
              Your Profile
            </Text>
            <Text fontSize="$4" color="$black11">
              Update your profile information
            </Text>
          </YStack>

          {/* Profile Image */}
          <ProfileImagePicker
            currentImage={profileImageUri}
            onImageChange={handleImageChange}
          />

          {/* Form Fields */}
          <YStack gap={"$3"}>
            <ProfileFormField
              name="name"
              control={control}
              placeholder="Enter your name"
              maxLength={50}
            />

            <ProfileFormField
              name="username"
              control={control}
              placeholder="Enter your username"
              maxLength={30}
            />
            <ProfileFormField
              name="bio"
              control={control}
              placeholder="Tell us about yourself..."
              multiline
              maxLength={100}
            />
          </YStack>
          <Button
            icon={<Save size={25} />}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || isSubmitting}
            bg="$blue9"
            color="white"
            opacity={isDirty ? 1 : 0.5}
            size={"$5"}
            width={"max-content"}
            self={"flex-end"}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
