<?php

namespace App\Controller\Group;

use App\Controller\ApiController;
use App\Entity\Group;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;

class ResetInviteKey extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @Route("/groups/{id}/reset-invite-key", methods={"POST"})
     * @OA\Response(
     *  response=200,
     *  description="Reset invite key of a group",
     *  @OA\JsonContent(
     *    type="string",
     *  )
     * )
     * @OA\Tag(name="group")
     * @Security(name="api_key")
     */
    public function index(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $group = $this->em->getRepository(Group::class)->findOneById($id);
        if (empty($group)) {
            return new JsonResponse(['error' => 'Not Found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $group);

        $group->resetSecretKey();

        $this->getUser()->setLastActivityDate(time());
        $this->em->persist($this->getUser());
        $this->em->persist($group);
        $this->em->flush();

        return new JsonResponse(['inviteKey' => $group->getSecretKey()], JsonResponse::HTTP_OK);
    }
}
