import React from "react";
import Slider from "react-slick";
import { WrapperSliderStyle } from "./style";

const SlideComponent = ({ length, children, slidesToShow }) => {
  const isSingle = length === 1;

  const settings = {
    dots: !isSingle,
    arrows: !isSingle,
    infinite: !isSingle,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, slidesToShow),
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, slidesToShow),
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return <WrapperSliderStyle {...settings}>{children}</WrapperSliderStyle>;
};

export default SlideComponent;
