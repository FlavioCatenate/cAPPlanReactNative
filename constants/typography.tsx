import Colors from "./colors";

interface TypographyStyle {
  fontSize: number;
  fontWeight: 700 | 600 | 400;
  color: string;
}

const Typography = {
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: Colors.textColor,
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
};

export default Typography;
