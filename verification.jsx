import React, { useState } from "react";

import {
  Box,
  Stack,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";

import toast, { Toaster } from "react-hot-toast";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import OtpInput from "otp-input-react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "./firebase.config";

const OTPVerification = () => {
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [showotp, setShowOtp] = useState(false);
  const [user, setUser] = useState(null);

  const onSignup = () => {
    setLoading(true);
    onCapVerify();

    const appVerifier = window.recaptchaVerifier;

    const formatPh = "+" + phone;

    signInWithPhoneNumber(auth, formatPh, appVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setLoading(false);
        setShowOtp(true);
        toast.success("Otp sended successfully!");
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const onCapVerify = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            onSignup();
          },
          "expired-callback": () => {
            toast.error("Expired callback");
          },
        }
      );
    }
  };

  const onOTPVerification = () => {
    setLoading(true);
    window.confirmationResult
      .confirm(otp)
      .then(async (res) => {
        // User signed in successfully.
        console.log(res);
        setUser(res.user);
        setLoading(false);
        // ...
      })
      .catch((error) => {
        // User couldn't sign in (bad verification code?)
        // ...
        console.log(error);
        setLoading(false);
      });
  };

  return (
    <>
      <Box sx={{ mt: 5, pt: 5 }}>
        <div>
          <Toaster toastOptions={{ duration: 4000 }} />
        </div>
        <div id="recaptcha-container"></div>

        {user ? (
          <Typography>Login Success</Typography>
        ) : (
          <>
            <Stack
              direction="column"
              spacing={5}
              alignItems="center"
              justifyContent="center"
            >
              {showotp ? (
                // if otp is sent
                <>
                  <OtpInput
                    OTPLength={6}
                    otpType="number"
                    disabled={false}
                    autoFocus
                    value={otp}
                    onChange={setOtp}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  />
                  <Button
                    onClick={onOTPVerification}
                    variant="contained"
                    color="primary"
                    // onClick={handleVerifyOTP}
                    // disabled={!isOTPValid}
                  >
                    {loading && (
                      <CircularProgress
                        color="warning"
                        thickness={4.5}
                        size={20}
                        sx={{ px: 1 }}
                      />
                    )}
                    <span>Verify OTP</span>
                  </Button>
                </>
              ) : (
                // else not sent
                <>
                  <Typography sx={{ fontSize: 24 }}>Login</Typography>

                  <Box>
                    <PhoneInput
                      country={"in"}
                      value={phone}
                      onChange={setPhone}
                    />
                  </Box>

                  <Button
                    onClick={onSignup}
                    variant="contained"
                    color="secondary"
                    sx={{ px: 5 }}
                    // onClick={handleVerifyOTP}
                    // disabled={!isOTPValid}
                  >
                    <span>Send OTP via Mobile No.</span>
                  </Button>
                </>
              )}
            </Stack>
          </>
        )}
      </Box>
    </>
  );
};

export default OTPVerification;
