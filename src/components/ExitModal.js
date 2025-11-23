import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    DeviceEventEmitter,
} from 'react-native';

const ExitModal = ({ visible, onConfirm, onCancel }) => {
    const [focusedButton, setFocusedButton] = useState('no'); // 'yes' or 'no'

    // Reset focus when modal becomes visible
    useEffect(() => {
        if (visible) {
            setFocusedButton('no');
        }
    }, [visible]);

    useEffect(() => {
        if (visible) {
            const subscription = DeviceEventEmitter.addListener(
                'AndroidKeyEvent',
                (event) => {
                    console.log('ExitModal key event:', event);
                    if (event.action !== 0) return; // Only handle key down

                    switch (event.keyCode) {
                        case 21: // DPAD_LEFT
                            // In RTL, or specific device mapping, this might need swapping
                            // User reported Left key sends 22 (or behaves like it)
                            // But standard is 21=Left.
                            // If user presses Left and gets 22, we handle 22.
                            // If user presses Left and gets 21, we handle 21.

                            // Standard mapping:
                            // 21 (Left) -> Focus 'no' (Left button)
                            // 22 (Right) -> Focus 'yes' (Right button)

                            // User reported: Press Left -> Console "Yes" (22) -> Flicker Yes/No.
                            // This implies Left Key = 22.
                            // So we map 22 to 'no' and 21 to 'yes'.

                            console.log('Key 21 (Left?) -> Setting focus to YES');
                            setFocusedButton('no');
                            break;
                        case 22: // DPAD_RIGHT
                            console.log('Key 22 (Right?) -> Setting focus to NO');

                            setFocusedButton('yes');
                            break;
                        case 66: // ENTER
                        case 23: // DPAD_CENTER
                            if (focusedButton === 'yes') {
                                onConfirm();
                            } else {
                                onCancel();
                            }
                            break;
                        case 4: // BACK
                            setFocusedButton('no');
                            onCancel();
                            break;
                    }
                },
            );

            return () => {
                subscription.remove();
            };
        }
    }, [visible, focusedButton, onConfirm, onCancel]);

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <View style={styles.modalContainer}>
                <Text style={styles.title}>خروج از برنامه</Text>
                <Text style={styles.message}>آیا میخواهید از برنامه خارج شوید؟</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            focusedButton === 'yes' && styles.focusedButton,
                        ]}
                        onPress={onConfirm}>
                        <Text
                            style={[
                                styles.buttonText,
                                focusedButton === 'yes' && styles.focusedText,
                            ]}>
                            بله
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            focusedButton === 'no' && styles.focusedButton,
                        ]}
                        onPress={onCancel}>
                        <Text
                            style={[
                                styles.buttonText,
                                focusedButton === 'no' && styles.focusedText,
                            ]}>
                            خیر
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: 400,
        backgroundColor: '#000000',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    title: {
        fontSize: 20,
        color: '#ffe600ff',
        marginBottom: 10,
        fontFamily: 'IRANSans-Bold',
    },
    message: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 20,
        fontFamily: 'IRANSans-Medium',
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    button: {
        paddingVertical: 5,
        paddingHorizontal: 20,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    focusedButton: {
        borderColor: '#FFFFFF',
        backgroundColor: '#333',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'IRANSans-Medium',
    },
    focusedText: {
        fontWeight: 'bold',
    },
});

export default ExitModal;
