<?php

namespace App\Controller\File;

use App\Controller\ApiController;
use App\Entity\File;
use App\Form\FileType;
use App\Service\Image as ImageService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use Swagger\Annotations as SWG;

class Upload extends ApiController
{
    private $factory;
    private $validator;

    public function __construct(
        EntityManagerInterface $em,
        FormFactoryInterface $factory,
        ValidatorInterface $validator,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
        $this->factory = $factory;
        $this->validator = $validator;
    }

    /**
     * @Route("/files", methods={"POST"})
     * @SWG\Parameter(
     *  name="file",
     *  in="formData",
     *  type="file",
     * )
     * @SWG\Parameter(
     *  name="fileIndex",
     *  in="formData",
     *  type="integer",
     * )
     * @SWG\Response(
     *  response=201,
     *  description="Upload a file",
     *  @Model(type=App\Entity\File::class, groups={"read_file"})
     * )
     * @SWG\Tag(name="file")
     * @Security(name="api_key")
     */
    public function index(Request $request, ImageService $imageService): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        if (!file_exists($this->getParameter('dir.files'))) {
            mkdir($this->getParameter('dir.files'));
        }
        $filesDir = realpath($this->getParameter('dir.files'));
        if (!is_writeable($filesDir)) {
            throw new \Exception("Target directory ($filesDir [".$this->getParameter('dir.files').']) is not writable !');
        }

        $file = new File();
        $form = $this->createForm(FileType::class, $file);
        $form->submit($request->files->all());
        if ($form->isValid()) {
            // persist file first to let Vich bundle populate the object attributes
            $this->em->persist($file);

            // check if it's an accepted filetype
            // TODO: rework this ugly code

            // check if mimetype is in accepted list
            if (
                !in_array(explode("/", $file->getType())[0], ["image", "video", "audio"])
                && $file->getType() !== "application/pdf"
            ) {
                return new JsonResponse(['error' => 'Unsupported file type'], Response::HTTP_BAD_REQUEST);
            }

            // check if mimetype is currently allowed
            if ('image/' == substr($file->getType(), 0, 6) && $this->getParameter('allow.upload.image') != "true") {
                return new JsonResponse(['error' => 'Unsupported file type'], Response::HTTP_BAD_REQUEST);
            }
            if ('video/' == substr($file->getType(), 0, 6) && $this->getParameter('allow.upload.video') != "true") {
                return new JsonResponse(['error' => 'Unsupported file type'], Response::HTTP_BAD_REQUEST);
            }
            if ('audio/' == substr($file->getType(), 0, 6) && $this->getParameter('allow.upload.audio') != "true") {
                return new JsonResponse(['error' => 'Unsupported file type'], Response::HTTP_BAD_REQUEST);
            }
            if ('application/pdf' == $file->getType() && $this->getParameter('allow.upload.pdf') != "true") {
                return new JsonResponse(['error' => 'Unsupported file type'], Response::HTTP_BAD_REQUEST);
            }

            // don't convert video if it's an mp4 and under 10Mo
            // TODO: the issue is that these mp4 could have libmp3lame audio instead of aac
            // this will cause audio playback issues on iOS.
            if (
                'video/mp4' == $file->getType()
                && File::STATUS_READY != $file->getStatus()
                && $file->getSize() < 10 * 1024 * 1024
            ) {
                $file->setStatus(File::STATUS_READY);
            }

            // don't convert a gif
            // TODO: handle gif correctly, AKA convert them to mp4
            if (
                'image/gif' == $file->getType()
                && File::STATUS_READY != $file->getStatus()
            ) {
                $file->setStatus(File::STATUS_READY);
            }

            // don't convert a pdf
            if (
                'application/pdf' == $file->getType()
                && File::STATUS_READY != $file->getStatus()
            ) {
                $file->setStatus(File::STATUS_READY);
            }

            // immediately process the file if it's an image
            if (
                'image/' == substr($file->getType(), 0, 6)
                && File::STATUS_READY != $file->getStatus()
            ) {
                list($width, $height) = getimagesize($filesDir.'/'.$file->getContentUrl());
                // This is a special check for long format images that should not be limited in height
                // example: https://imgs.xkcd.com/comics/earth_temperature_timeline.png
                if ($height / $width > 10) {
                    $newContentUrl = pathinfo($file->getContentUrl(), PATHINFO_FILENAME).'.jpg';
                    $imageService->createThumbnail(
                        $filesDir.'/'.$file->getContentUrl(),
                        $filesDir.'/'.$newContentUrl,
                        2048,
                        999999
                    );
                    $file->setContentUrl($newContentUrl);
                } else {
                    if ($width > 2048 || $height > 2048 || 'image/jpeg' !== $file->getType()) {
                        $newContentUrl = pathinfo($file->getContentUrl(), PATHINFO_FILENAME).'.jpg';
                        $imageService->createThumbnail(
                            $filesDir.'/'.$file->getContentUrl(),
                            $filesDir.'/'.$newContentUrl,
                            2048,
                            2048
                        );
                        $file->setContentUrl($newContentUrl);
                    }
                }
                $file->setStatus(File::STATUS_READY);
            }

            if ($request->request->get('fileIndex')) {
                $file->setFileIndex($request->request->get('fileIndex'));
            }

            $this->em->flush();

            // Prevent the serialization of the file property
            $file->setFile(null);

            return new Response(
                $this->serialize($file, ['read_file']),
                Response::HTTP_CREATED
            );
        }

        throw new \Exception($this->validator->validate($file));
    }
}
