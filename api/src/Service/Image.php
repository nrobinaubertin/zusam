<?php

namespace App\Service;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class Image
{
    private $params;

    public function __construct(ParameterBagInterface $params)
    {
        $this->params = $params;
    }

    private function prepareImage(\Imagick $im): \Imagick
    {
        // set the image background to white by default
        $im->setImageBackgroundColor(new \ImagickPixel('white'));
        $im->setImageAlphaChannel(\Imagick::ALPHACHANNEL_REMOVE);
        if ('image/gif' === $im->getImageMimeType()) {
            $im->mergeImageLayers(\Imagick::LAYERMETHOD_FLATTEN);
        }

        return $im;
    }

    public function createThumbnail(string $input, string $output, int $w, int $h, bool $respectFormat = true): void
    {
        $im = new \Imagick();
        if ($respectFormat) {
            $im = $this->loadResizeImage($input, $w, $h);
            $im = $this->prepareImage($im);
            $im->resizeImage(
                min($im->getImageWidth(), $w),
                min($im->getImageHeight(), $h),
                \Imagick::FILTER_LANCZOS,
                1,
                true
            );
        } else {
            $im = $this->load($input);
            $im = $this->prepareImage($im);
            $im->cropThumbnailImage(
                min($im->getImageWidth(), $w),
                min($im->getImageHeight(), $h)
            );
        }

        // Handle image orientation
        $orientation = $im->getImageOrientation();
        switch ($orientation) {
            case \Imagick::ORIENTATION_BOTTOMRIGHT:
                $im->rotateimage('#000', 180); // rotate 180 degrees
                break;

            case \Imagick::ORIENTATION_RIGHTTOP:
                $im->rotateimage('#000', 90); // rotate 90 degrees CW
                break;

            case \Imagick::ORIENTATION_LEFTBOTTOM:
                $im->rotateimage('#000', -90); // rotate 90 degrees CCW
                break;
        }
        // Now that it's auto-rotated, make sure the EXIF data is correct in case the EXIF gets saved with the image!
        $im->setImageOrientation(\Imagick::ORIENTATION_TOPLEFT);

        $this->saveImage($im, $output);
        $im->destroy();
    }

    public static function extractImageFromVideo(string $input, $ffmpegPath): string
    {
        $output = tempnam(sys_get_temp_dir(), 'zusam_temp').'.jpg';
        exec($ffmpegPath.' -y -i '.$input.' -vframes 1 -ss 0 -f image2 '.$output);

        return $output;
    }

    public static function extractImageFromPdf(string $input, $ghostscriptPath): string
    {
        $output = tempnam(sys_get_temp_dir(), 'zusam_temp').'.jpg';
        exec($ghostscriptPath.' -dBATCH -dNOPAUSE -q -o "'.$output.'" -dFirstPage=1 -dLastPage=1 -r72 -dJPEGQ=100 -sDEVICE=jpeg "'.$input.'"');
        return $output;
    }

    private function loadResizeImage(string $input, int $w, int $h): \Imagick
    {
        $im = new \Imagick();
        try {
            if (preg_match('/video/', mime_content_type($input))) {
                $input = $this->extractImageFromVideo($input, $this->params->get('binaries.ffmpeg'));
            }
            if (preg_match('/pdf/', mime_content_type($input))) {
                $input = $this->extractImageFromPdf($input, $this->params->get('binaries.ghostscript'));
            }
            if (is_readable($input)) {
                // https://secure.php.net/manual/en/imagick.setsize.php#110166
                $im->pingImage($input);
                if ($im->getImageWidth() > $w || $im->getImageHeight() > $h) {
                    $aspect_ratio = $im->getImageWidth() / $im->getImageHeight();
                    $width = min($w, $im->getImageWidth());
                    $height = min($h, floor($width / $aspect_ratio), $im->getImageHeight());
                    $width = floor($height * $aspect_ratio);
                    $im->setSize(intval($width), intval($height));
                }

                if ($im->readImage($input)) {
                    return $im;
                }
            }
            throw new \Exception("Something went wrong while loading $input.");
        } catch (\Exception $e) {
            $im->destroy(); // remove previous imagick instance
            $im = $this->load($input);

            return $im;
        }
    }

    private function load(string $input): \Imagick
    {
        $im = new \Imagick();
        // TODO: add a check if file_exists and filesize > 0
        try {
            if (is_readable($input)) {
                if (preg_match('/video/', mime_content_type($input))) {
                    $input = $this->extractImageFromVideo($input, $this->params->get('binaries.ffmpeg'));
                }
                if (preg_match('/pdf/', mime_content_type($input))) {
                    $input = $this->extractImageFromPdf($input, $this->params->get('binaries.ghostscript'));
                }

                if ($im->readImage($input)) {
                    return $im;
                }
            } else {
                if ('data' == substr($input, 0, 4)) {
                    $im->readImageBlob(base64_decode(explode(',', $input, 2)[1]));

                    return $im;
                } else {
                    $client = new \GuzzleHttp\Client();
                    $res = $client->request('GET', $input);
                    if (200 == $res->getStatusCode()) {
                        if ($im->readImageBlob($res->getBody())) {
                            return $im;
                        }
                    } else {
                        throw new \Exception('Guzzle got status '.$res->getStatusCode()." while trying to retrieve $input.");
                    }
                }
            }
            throw new \Exception("Something went wrong while loading $input.");
        } catch (\Exception $e) {
            throw new \Exception('Could not load input image: '.$e->getMessage().", $input");
        }
    }

    private function saveImage(\Imagick $im, string $output)
    {
        // https://developers.google.com/speed/docs/insights/OptimizeImages
        $im->setImageFormat('jpeg');
        $im->stripImage();
        $im->setImageCompression(\Imagick::COMPRESSION_JPEG);
        $im->setImageCompressionQuality(85);
        $im->setSamplingFactors(['2x2', '1x1', '1x1']);
        if (\Imagick::COLORSPACE_CMYK == $im->getImageColorspace()) {
            $im->transformimagecolorspace(\Imagick::COLORSPACE_SRGB);
        }
        $im->setInterlaceScheme(\Imagick::INTERLACE_JPEG);
        if (!$im->writeImage($output)) {
            throw new \Exception('Could not save output image');
        }
    }

    // https://www.php.net/manual/en/function.imagecreatefromgif.php#104473
    // Returns the number of frames in a given gif
    public static function getGifFrameCount(string $filename): int
    {
        if (!($fh = @fopen($filename, 'rb'))) {
            return 0;
        }
        $count = 0;
        // an animated gif contains multiple "frames", with each frame having a
        // header made up of:
        // * a static 4-byte sequence (\x00\x21\xF9\x04)
        // * 4 variable bytes
        // * a static 2-byte sequence (\x00\x2C) (some variants may use \x00\x21 ?)

        // We read through the file til we reach the end of the file, or we've found
        // at least 2 frame headers
        while (!feof($fh)) {
            $chunk = fread($fh, 1024 * 100); //read 100kb at a time
            $count += preg_match_all('#\x00\x21\xF9\x04.{4}\x00(\x2C|\x21)#s', $chunk, $matches);
        }

        fclose($fh);
        return $count;
    }

    // Reduce the size of the given gif
    // Should be used only if
    // filesize(filename) > $target_size*$target_size*250*getGifFrameCount($filename)/1024
    public static function compressGif(string $filename, string $outputname, int $target_size)
    {
        try {
            $animation = new \Imagick($filename);
            $gif = new \Imagick();

            $animation = $animation->coalesceImages();
            foreach ($animation as $frame) {
                // Resize each frame
                $frame->resizeImage(
                    min($frame->getImageWidth(), $target_size),
                    min($frame->getImageHeight(), $target_size),
                    \Imagick::FILTER_BOX,
                    1,
                    true
                );

                // Reduce number of colors by creating a palette based on the current image
                $palette = clone $frame;
                $palette->quantizeImage(48, \Imagick::COLORSPACE_YCBCR, 0, false, false);
                $palette->uniqueImageColors();
                $frame->remapImage($palette, \Imagick::DITHERMETHOD_FLOYDSTEINBERG);
                $palette->clear();

                $gif->addImage($frame->getImage());
            }

            $gif->writeImages($outputname, true);
        } catch (\Exception $e) {
            throw new \Exception("Something went wrong while processing $filename.");
        }
    }
}
