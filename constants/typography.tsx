import Colors from "./colors";

interface TypographyStyle {
  fontSize: number;
  fontWeight: 700 | 600 | 400;
  borderRadius?: number;
  color: string;
}

const Typography = {
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: Colors.mainTextColor,
  } as TypographyStyle,
  subtitle: {
    fontSize: 18,
    fontWeight: 600,
    color: Colors.textColor,
  } as TypographyStyle,
  body: {
    fontSize: 14,
    fontWeight: 400,
    color: Colors.textColor,
  } as TypographyStyle,
  borderRadius: 14,
};

export default Typography;
