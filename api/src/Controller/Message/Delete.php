<?php

namespace App\Controller\Message;

use App\Controller\ApiController;
use Symfony\Component\HttpFoundation\Response;
use App\Entity\Message;
use App\Entity\Notification;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;

class Delete extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @Route("/messages/{id}", methods={"DELETE"})
     * @OA\Response(
     *  response=204,
     *  description="Delete a message"
     * )
     * @OA\Tag(name="message")
     * @Security(name="api_key")
     */
    public function index(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $message = $this->em->getRepository(Message::class)->findOneById($id);
        if (empty($message)) {
            return new JsonResponse(['error' => 'Not Found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user == object.getAuthor()'), $message);

        $notifications = $this->em->getRepository(Notification::class)->findByTarget($id);
        foreach ($notifications as $n) {
            $this->em->remove($n);
        }

        $this->getUser()->setLastActivityDate(time());
        $this->em->persist($this->getUser());

        $this->em->remove($message);
        $this->em->flush();

        return new JsonResponse(null, JsonResponse::HTTP_NO_CONTENT);
    }
}
