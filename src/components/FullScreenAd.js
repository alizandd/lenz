import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Modal,
    Platform,
    BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';

const FullScreenAd = ({ visible, onClose }) => {
    const [canClose, setCanClose] = useState(false);
    const [timeLeft, setTimeLeft] = useState(10);
    const closeButtonRef = useRef(null);

    useEffect(() => {
        let timer;
        if (visible) {
            setCanClose(false);
            setTimeLeft(10);

            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setCanClose(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [visible]);

    // Handle Back Button
    useEffect(() => {
        const backAction = () => {
            if (visible) {
                if (canClose) {
                    onClose();
                }
                return true; // Consume the event
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [visible, canClose, onClose]);

    // Auto-focus the close button when it becomes active (for TV)
    useEffect(() => {
        if (visible && canClose && closeButtonRef.current) {
            // On TV, we might want to force focus, but React Native's focus engine usually handles it 
            // if it's the only focusable element or if we request it.
            // setNativeProps is sometimes used for this, or hasTVPreferredFocus
        }
    }, [visible, canClose]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="fade"
            onRequestClose={() => {
                if (canClose) onClose();
            }}
        >
            <View style={styles.container}>
                <WebView
                    source={{ uri: 'https://samyar.rasgames.ir/sam.html' }}
                    style={styles.webview}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        ref={closeButtonRef}
                        style={[
                            styles.closeButton,
                            !canClose && styles.disabledButton
                        ]}
                        onPress={onClose}
                        disabled={!canClose}
                        activeOpacity={0.7}
                        hasTVPreferredFocus={canClose} // Try to grab focus when active
                    >
                        <Text style={styles.closeText}>
                            {canClose ? 'بستن تبلیغ' : `بستن (${timeLeft})`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    webview: {
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        zIndex: 1000,
    },
    closeButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#fff',
        minWidth: 120,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderColor: '#888',
    },
    closeText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'IRANSans-Medium',
    },
});

export default FullScreenAd;
