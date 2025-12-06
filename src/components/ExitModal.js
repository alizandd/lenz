import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    DeviceEventEmitter,
} from 'react-native';

const ExitModal = ({ visible, onConfirm, onCancel }) => {
    const [focusedButton, setFocusedButton] = useState('no'); // 'yes' or 'no'
    
    // Use ref to always have the latest value in the event handler
    const focusedButtonRef = useRef(focusedButton);
    const onConfirmRef = useRef(onConfirm);
    const onCancelRef = useRef(onCancel);
    
    // Keep refs in sync with state/props
    useEffect(() => {
        focusedButtonRef.current = focusedButton;
    }, [focusedButton]);
    
    useEffect(() => {
        onConfirmRef.current = onConfirm;
        onCancelRef.current = onCancel;
    }, [onConfirm, onCancel]);

    // Reset focus when modal becomes visible
    useEffect(() => {
        if (visible) {
            setFocusedButton('no');
            focusedButtonRef.current = 'no';
        }
    }, [visible]);

    useEffect(() => {
        if (!visible) return;
        
        const subscription = DeviceEventEmitter.addListener(
            'AndroidKeyEvent',
            (event) => {
                console.log('ExitModal key event:', event, 'Current focus:', focusedButtonRef.current);
                if (event.action !== 0) return; // Only handle key down

                switch (event.keyCode) {
                    case 21: // DPAD_LEFT
                        console.log('Key 21 (Left) -> Setting focus to NO');
                        setFocusedButton('no');
                        focusedButtonRef.current = 'no';
                        break;
                    case 22: // DPAD_RIGHT
                        console.log('Key 22 (Right) -> Setting focus to YES');
                        setFocusedButton('yes');
                        focusedButtonRef.current = 'yes';
                        break;
                    case 66: // ENTER
                    case 23: // DPAD_CENTER
                        console.log('ENTER/CENTER pressed, focused on:', focusedButtonRef.current);
                        if (focusedButtonRef.current === 'yes') {
                            console.log('Calling onConfirm (exit app)');
                            onConfirmRef.current();
                        } else {
                            console.log('Calling onCancel (close modal)');
                            onCancelRef.current();
                        }
                        break;
                    case 4: // BACK
                        console.log('BACK pressed, closing modal');
                        setFocusedButton('no');
                        focusedButtonRef.current = 'no';
                        onCancelRef.current();
                        break;
                }
            },
        );

        return () => {
            subscription.remove();
        };
    }, [visible]); // Only depend on visible, use refs for everything else

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
        color: '#008cffff',
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
