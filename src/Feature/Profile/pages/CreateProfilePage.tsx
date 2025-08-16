import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react-native";
import { useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Button, Text, YStack } from "tamagui";
import { ProfileImagePicker } from "../components/ImagePicker";
import { ProfileFormField } from "../components/ProfileFormField";
import { useCreateProfile } from "../hooks/useCreateProfile";
import { profileSchema, type ProfileFormData } from "../utils/SchemaValidation";
export function EditProfileScreen() {
  const initialValues: ProfileFormData = {
    name: "",
    username: "",
    bio: "",
    profileImage: undefined,
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
  const { createProfile } = useCreateProfile();
  const profileImage = watch("profileImage");
  const onSubmit = async (data: ProfileFormData) => {
    try {
      await createProfile(data);
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };
  const handleImageChange = (imageUri: string) => {
    setValue("profileImage", imageUri, { shouldDirty: true });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: "$black2", height: "100%" }}
      >
        <YStack gap="$4" p="$4" bg="$black2" minH="100%">
          {/* Header */}
          <YStack gap="$2" items="center" pt="$6">
            <Text fontSize="$8" fontWeight="bold" color="white">
              Edit Profile
            </Text>
            <Text fontSize="$4" color="$black11">
              Update your profile information
            </Text>
          </YStack>

          {/* Profile Image */}
          <ProfileImagePicker
            currentImage={profileImage}
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
            icon={Save}
            onPress={handleSubmit(onSubmit)}
            disabled={!isDirty || isSubmitting}
            bg="$blue9"
            color="white"
            opacity={isDirty ? 1 : 0.5}
            size={"$5"}
            width={"75%"}
            mx={"auto"}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
