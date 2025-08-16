import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView, Text, YStack } from "tamagui";

interface UserProfile {
  name: string;
  username: string;
  bio: string;
  profileImage?: string;
}

interface EditProfileScreenProps {
  initialProfile: UserProfile;
  onSave: (profile: UserProfile) => Promise<void>;
  onCancel: () => void;
}

export function EditProfileScreen({
  initialProfile,
  onSave,
  onCancel,
}: EditProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof UserProfile, string>>
  >({});

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(initialProfile);

  const validateProfile = (): boolean => {
    const newErrors: Partial<Record<keyof UserProfile, string>> = {};

    if (!profile.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!profile.username.trim()) {
      newErrors.username = "Username is required";
    } else if (profile.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(profile.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    if (profile.bio.length > 150) {
      newErrors.bio = "Bio must be 150 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateProfile()) return;

    setIsSaving(true);
    try {
      await onSave(profile);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={{ flex: 1, backgroundColor: "$dark1" }}>
        <YStack gap="$4" p="$4" bg="$black2" min="100%">
          {/* Header */}
          <YStack gap="$2" items="center" pt="$6">
            <Text fontSize="$8" fontWeight="bold" color="$color">
              Edit Profile
            </Text>
            <Text fontSize="$4" color="$black11">
              Update your profile information
            </Text>
          </YStack>

          {/* Profile Image */}
          <ProfileImagePicker
            currentImage={profile.profileImage}
            onImageChange={(imageUri) =>
              updateProfile("profileImage", imageUri)
            }
          />

          {/* Form Fields */}
          <YStack gap="$4">
            <ProfileFormField
              label="Display Name"
              value={profile.name}
              onChangeText={(text) => updateProfile("name", text)}
              placeholder="Enter your display name"
              maxLength={50}
              error={errors.name}
            />

            <ProfileFormField
              label="Username"
              value={profile.username}
              onChangeText={(text) =>
                updateProfile("username", text.toLowerCase())
              }
              placeholder="Enter your username"
              maxLength={30}
              error={errors.username}
            />

            <ProfileFormField
              label="Bio"
              value={profile.bio}
              onChangeText={(text) => updateProfile("bio", text)}
              placeholder="Tell us about yourself..."
              multiline
              maxLength={150}
              error={errors.bio}
            />
          </YStack>

          {/* Actions */}
          <ProfileActions
            onSave={handleSave}
            onCancel={onCancel}
            isSaving={isSaving}
            hasChanges={hasChanges}
          />
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
