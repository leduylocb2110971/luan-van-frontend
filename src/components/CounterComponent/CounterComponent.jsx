import React from "react";
import CountUp from "react-countup";

const CounterComponent = ({ end, duration = 2, suffix = "" }) => {
  return (
    <CountUp
      start={0}
      end={end}
      duration={duration}
      separator=","
      suffix={suffix}
    />
  );
};

export default CounterComponent;
