import Image, { ImageProps } from "next/image";

interface Base64ImageProps extends Omit<ImageProps, "src"> {
  imageType?: string;
  base64String?: string;
  alt: string;
  width: number;
  height: number;
}

const Base64Image = ({
  imageType,
  base64String,
  alt,
  width,
  height,
  ...props
}: Base64ImageProps) => {
  return (
    <div>
      <Image
        src={`data:${imageType};base64,${base64String}`}
        alt={alt}
        width={width}
        height={height}
        unoptimized={true}
        {...props}
      />
    </div>
  );
};

export default Base64Image;
