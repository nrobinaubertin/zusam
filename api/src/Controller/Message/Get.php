<?php

namespace App\Controller\Message;

use App\Entity\Message;
use App\Controller\ApiController;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;

class Get extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @Route("/messages/{id}", methods={"GET"})
     * @OA\Response(
     *  response=200,
     *  description="Get a message",
     *  @Model(type=App\Entity\Message::class, groups={"read_message"})
     * )
     * @OA\Tag(name="message")
     * @Security(name="api_key")
     */
    public function index(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $message = $this->em->getRepository(Message::class)->findOneById($id);
        if (empty($message)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $message->getGroup());

        return new Response(
            $this->serialize($message, ['read_message']),
            Response::HTTP_OK
        );
    }
}
