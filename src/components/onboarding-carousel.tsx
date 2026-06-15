import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Image,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { NeonButton } from "@/components/neon-button";
import { neon } from "@/theme/colors";

export type OnboardingSlide = {
  icon: ImageSourcePropType;
  title: string;
  body: string;
};

/**
 * Pełnoekranowy onboarding w formie przesuwanych slajdów (ikona + tytuł + opis), kropki postępu
 * i przycisk „Dalej / Rozumiem”. Zamykany krzyżykiem albo na ostatnim slajdzie.
 */
export function OnboardingCarousel({
  slides,
  onClose,
}: {
  slides: OnboardingSlide[];
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const isLast = page >= slides.length - 1;

  const onMomentum = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const goNext = () => {
    if (isLast) {
      onClose();
      return;
    }
    scrollRef.current?.scrollTo({ animated: true, x: (page + 1) * width });
  };

  return (
    <View
      style={{
        backgroundColor: neon.bg,
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0,
        zIndex: 50,
      }}
    >
      <Pressable
        accessibilityLabel="Zamknij"
        accessibilityRole="button"
        hitSlop={10}
        onPress={onClose}
        style={{
          alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.06)",
          borderRadius: 20,
          height: 40,
          justifyContent: "center",
          position: "absolute",
          right: 16,
          top: insets.top + 10,
          width: 40,
          zIndex: 2,
        }}
      >
        <Ionicons color={neon.white} name="close" size={22} />
      </Pressable>

      <ScrollView
        horizontal
        onMomentumScrollEnd={onMomentum}
        pagingEnabled
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {slides.map((slide, i) => (
          <View
            key={i}
            style={{
              alignItems: "center",
              gap: 30,
              justifyContent: "center",
              paddingHorizontal: 32,
              paddingTop: insets.top,
              width,
            }}
          >
            <View
              style={{
                shadowColor: neon.purpleBright,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 30,
              }}
            >
              <Image resizeMode="contain" source={slide.icon} style={{ height: 144, width: 144 }} />
            </View>
            <View style={{ alignItems: "center", gap: 12 }}>
              <Text className="text-center text-2xl font-extrabold text-foreground">
                {slide.title}
              </Text>
              <Text
                className="text-center text-base text-muted"
                style={{ lineHeight: 24, maxWidth: 320 }}
              >
                {slide.body}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ gap: 18, paddingBottom: insets.bottom + 18, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: "row", gap: 8, justifyContent: "center" }}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                backgroundColor: i === page ? neon.purpleBright : "rgba(255,255,255,0.2)",
                borderRadius: 4,
                height: 8,
                width: i === page ? 22 : 8,
              }}
            />
          ))}
        </View>
        <NeonButton
          label={isLast ? "Rozumiem" : "Dalej"}
          onPress={goNext}
          variant={isLast ? "pink" : "violet"}
        />
      </View>
    </View>
  );
}
