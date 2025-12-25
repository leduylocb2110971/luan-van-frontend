import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";

/* ------------------ GLOBAL AURA GRADIENT ------------------ */
export const aura = `
    linear-gradient(135deg, #a5c8ff 0%, #d7e8ff 30%, #f7f9ff 60%, #ffe5f0 100%)
`;

export const softShadow = `
    0 8px 30px rgba(0,0,0,0.08)
`;

/* ------------------ HERO ------------------ */
export const Hero = styled.section`
  text-align: center;
  padding: 5rem 2rem;
  background: ${aura};
  border-radius: 24px;
  box-shadow: ${softShadow};
  animation: fadeIn 0.6s ease;

  h1 {
    font-size: 3rem;
    font-weight: 800;
    color: #1e3a8a;
    margin-bottom: 1rem;
    letter-spacing: -1px;
  }

  p {
    font-size: 1.2rem;
    color: #475569;
    margin-bottom: 2rem;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

/* ------------------ STATS ------------------ */
export const StatsSection = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-top: 30px;
  flex-wrap: wrap;
`;

export const StatCard = styled.div`
  text-align: center;
  padding: 20px 24px;
  border-radius: 20px;
  background: white;
  box-shadow: ${softShadow};
  min-width: 180px;
  transition: 0.25s ease;
  border: 1px solid #eef2ff;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 35px rgba(0,0,0,0.12);
  }

  h2 {
    margin: 0;
    font-size: 32px;
    font-weight: 800;
    color: #1e3a8a;
  }

  small {
    margin-top: 6px;
    display: block;
    color: #6b7280;
    font-size: 15px;
  }
`;

/* ------------------ CATEGORIES ------------------ */
export const Categories = styled.div`
  margin: 50px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  justify-content: center;
`;

export const CategoryChip = styled.div`
  padding: 12px 22px;
  background: #ffffff;
  border-radius: 40px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: ${softShadow};
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-3px);
    background: linear-gradient(135deg, var(--bg-start), var(--bg-end));
    color: white;
  }
`;

/* ------------------ THESIS SECTION ------------------ */
export const ThesisSection = styled.section`
  padding: 30px 24px;
  background: white;
  border-radius: 16px;
  box-shadow: ${softShadow};
  border: 1px solid #eef2ff;

  h2 {
    font-size: 1.9rem;
    margin-bottom: 20px;
    font-weight: 700;
    color: #1e293b;
  }
`;

/* ------------------ TAB MODERN ------------------ */
export const Tabs = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 22px;
  flex-wrap: wrap;
`;

export const Tab = styled.button`
  padding: 10px 20px;
  font-weight: 600;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  background: ${({ active }) =>
    active
      ? "linear-gradient(135deg, #2563eb, #4f46e5)"
      : "#f1f5f9"};
  color: ${({ active }) => (active ? "white" : "#334155")};
  box-shadow: ${softShadow};
  transition: all 0.25s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

/* ------------------ THESIS GRID ------------------ */
export const ThesisGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, 1fr);

  @media (min-width: 1500px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const ThumbnailWrapper = styled.div`
  width: 100%;
  height: 170px;
  border-radius: 12px;
  overflow: hidden;
  background: #f8fafc;
  display:flex;
  align-items:center;
  justify-content:center;
  border: 1px solid #e2e8f0;
`;

export const Thumbnail = styled.img`
  max-width:100%;
  max-height:100%;
  object-fit: contain;
`;

/* ------------------ THESIS CARD ------------------ */
export const ThesisCard = styled.div`
  background:white;
  border-radius:16px;
  padding:18px;
  box-shadow:${softShadow};
  border:1px solid #e0e7ff;
  transition:0.25s ease;
  display:flex;
  flex-direction:column;

  &:hover{
    transform:translateY(-6px);
    box-shadow:0 14px 40px rgba(0,0,0,0.12);
  }

  h4{
    font-size:0.9rem;
    font-weight:700;
    margin-top:8px;
    color:#1e293b;
    -webkit-line-clamp:3;
    display:-webkit-box;
    -webkit-box-orient:vertical;
    overflow:hidden;
  }

  small{
    margin-top:10px;
    line-height:1.4;
    font-size:12px;
    color:#64748b;
  }
`;

/* ------------------ LINK STYLE ------------------ */
export const gradientAnimation = keyframes`
  0% { background-position:0% 50%; }
  50% { background-position:100% 50%; }
  100% { background-position:0% 50%; }
`;

export const LinkStyled = styled(Link)`
  font-size: 20px;
  background: linear-gradient(90deg, #60a5fa, #2563eb, #4f46e5);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  animation: ${gradientAnimation} 3s ease infinite;
  text-decoration:none;

  display:flex;
  align-items:center;
  gap:6px;
`;

/* ------------------ UPLOAD SECTION ------------------ */
export const UploadSection = styled.section`
  padding: 20px 10px;
  border-radius: 24px;
  background: linear-gradient(135deg, #f899a9ff, #f9b790ff);
  text-align: center;
  color: #fff;
  box-shadow: ${softShadow};

  h2 {
    font-size: 2.2rem;
    margin-bottom: 10px;
    font-weight: 700;
  }

  p {
    font-size: 1.2rem;
    opacity: 0.9;
  }

  button {
    margin-top: 22px;
    padding: 14px 32px;
    border: none;
    border-radius: 40px;
    background: white;
    color: #ff4d6d;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: ${softShadow};
    transition: 0.25s ease;

    &:hover {
      transform: scale(1.08);
      box-shadow: 0 12px 30px rgba(255,255,255,0.4);
    }
  }
`;
