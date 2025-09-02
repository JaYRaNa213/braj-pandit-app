import React, { useEffect, useState, useRef } from 'react';
import { Text } from 'react-native';
import BackgroundTimer from 'react-native-background-timer';

const CountdownTimer = ({
  until,
  onFinish,
  setIsRechargePopupVisible,
  setShowRechargeBtn,
  fontSize,
  textColor,
}) => {
  const [timeLeft, setTimeLeft] = useState(until);
  const hasTriggeredPopup = useRef(false);
  const hasTriggeredRechargeBtn = useRef(false);
  const intervalIdRef = useRef(null); // Store interval ID to clear it on updates

  // Reset timeLeft and restart timer when 'until' changes
  useEffect(() => {
    // Clear existing interval if it exists
    if (intervalIdRef.current) {
      BackgroundTimer.clearInterval(intervalIdRef.current);
    }

    // Reset state and refs when 'until' changes
    setTimeLeft(until);
    hasTriggeredPopup.current = false;
    hasTriggeredRechargeBtn.current = false;

    // Start new timer
    const intervalId = BackgroundTimer.setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 1);

        if (newTime === 0) {
          BackgroundTimer.clearInterval(intervalId);
          if (onFinish) {
            onFinish();
          }
        }

        if (
          setIsRechargePopupVisible &&
          newTime < 120 &&
          !hasTriggeredPopup.current
        ) {
          setIsRechargePopupVisible(true);
          hasTriggeredPopup.current = true;
        }

        if (
          setShowRechargeBtn &&
          newTime <= 120 &&
          !hasTriggeredRechargeBtn.current
        ) {
          setShowRechargeBtn(true);
          hasTriggeredRechargeBtn.current = true;
        }

        return newTime;
      });
    }, 1000);

    intervalIdRef.current = intervalId; // Store the interval ID

    // Cleanup on unmount or when 'until' changes
    return () => {
      BackgroundTimer.clearInterval(intervalId);
    };
  }, [until, setIsRechargePopupVisible, setShowRechargeBtn, onFinish]); // Added 'until' to dependencies

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Text style={{ color: textColor || '#4B0082', fontSize: fontSize || 14 }}>
      {formatTime(timeLeft)}
    </Text>
  );
};

export default CountdownTimer;
