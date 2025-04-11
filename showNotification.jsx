import { updateLat } from "@/context/features/showSlice";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

const showNotification = (currLat) => {
  const dispatch = useDispatch();
  dispatch(updateLat(currLat));
  return;
};

export default showNotification;
