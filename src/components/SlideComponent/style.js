import styled from "styled-components";
import Slider from "react-slick";

// Wrapper slider
export const WrapperSliderStyle = styled(Slider)`
  max-width: 1500px;
  margin: 0 auto;

  .slick-slide {
    display: flex;
    justify-content: center;
    padding: 0 10px;
    box-sizing: border-box;
  }

  .slick-arrow.slick-prev,
  .slick-arrow.slick-next {
    z-index: 10;
    top: 50%;
    transform: translateY(-50%);
    &::before {
      font-size: 30px;
      color: #ccc;
    }
    &:hover::before {
      color: #6BCB77;
    }
  }

  .slick-dots {
    bottom: -25px;
    li button:before {
      font-size: 10px;
      color: #ccc;
    }
    li.slick-active button:before {
      color: #6BCB77;
    }
  }

  @media (max-width: 576px) {
    .slick-arrow {
      display: none;
    }
    .slick-slide {
      padding: 0 5px;
    }
  }
`;


