// =============================================================================
// Share Card Modal — preview + capture + native share sheet
// =============================================================================
// Native: react-native-view-shot captures the card to a tmp file and
// expo-sharing opens the OS share sheet. Web: capture to a data URI and
// trigger a download (Web Share with files is inconsistent across browsers;
// a saved image the user can post anywhere is the honest fallback).

import { useRef, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import ViewShot from 'react-native-view-shot';

import type { PetStats } from '@/components/pet';
import { colors, radius, spacing, textStyles } from '@/theme';
import type { PetType } from '@/types';
import { haptics } from '@/utils/haptics';
import { ShareCard } from './ShareCard';

interface ShareCardModalProps {
  visible: boolean;
  onClose: () => void;
  petType: PetType;
  petName: string;
  stats: PetStats;
  evolutionStage: 1 | 2 | 3 | 4;
  streakDays: number;
  totalWorkouts: number;
  totalFPEarned: number;
}

export function ShareCardModal({ visible, onClose, ...cardProps }: ShareCardModalProps) {
  const shotRef = useRef<ViewShot>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleShare = async () => {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    haptics.tap();

    try {
      if (Platform.OS === 'web') {
        const dataUri = await shotRef.current?.capture?.();
        if (!dataUri) throw new Error('capture failed');
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = `ironquest-${cardProps.petName || 'pet'}.png`;
        link.click();
        setNotice('Card saved — post it anywhere.');
      } else {
        const uri = await shotRef.current?.capture?.();
        if (!uri) throw new Error('capture failed');
        const Sharing = await import('expo-sharing');
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: 'image/png' });
        } else {
          setNotice('Sharing is not available on this device.');
        }
      }
      haptics.success();
    } catch (error) {
      console.warn('Share card capture failed:', error);
      // view-shot's web renderer can't rasterize SVG reliably; native
      // (the dogfooding surface) uses the well-supported tmpfile path.
      setNotice(
        Platform.OS === 'web'
          ? 'Capture isn\u2019t supported in the web preview yet \u2014 use the mobile app.'
          : 'Could not capture the card. Try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ViewShot
          ref={shotRef}
          options={{
            format: 'png',
            quality: 1,
            result: Platform.OS === 'web' ? 'data-uri' : 'tmpfile',
          }}
        >
          <ShareCard {...cardProps} />
        </ViewShot>

        {notice && <Text style={styles.notice}>{notice}</Text>}

        <View style={styles.actions}>
          <Pressable
            style={[styles.shareButton, busy && styles.buttonBusy]}
            onPress={handleShare}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Share this card"
          >
            <Text style={styles.shareText}>{busy ? 'Capturing…' : 'Share'}</Text>
          </Pressable>
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close share card"
          >
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[4],
  },
  notice: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginTop: spacing[3],
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[3],
    marginTop: spacing[5],
  },
  shareButton: {
    backgroundColor: colors.reward.fp,
    borderRadius: radius.lg,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[8],
  },
  buttonBusy: {
    opacity: 0.6,
  },
  shareText: {
    ...textStyles.buttonLarge,
    color: colors.background.primary,
  },
  closeButton: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
  },
  closeText: {
    ...textStyles.buttonLarge,
    color: colors.text.primary,
  },
});
