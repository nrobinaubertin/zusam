<?php

namespace App\Controller\Group;

use App\Controller\ApiController;
use App\Entity\Group;
use App\Entity\Notification;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;

class AddInvitedUser extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @Route("/groups/invitation/{inviteKey}", methods={"POST"})
     * @OA\Response(
     *  response=200,
     *  description="Add the logged in user to the group",
     *  @OA\JsonContent(type="string")
     * )
     * @OA\Tag(name="group")
     * @Security(name="api_key")
     */
    public function index(string $inviteKey): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $group = $this->em->getRepository(Group::class)->findOneBySecretKey($inviteKey);
        if (empty($group)) {
            return new JsonResponse(['error' => 'Invalid invite key !'], Response::HTTP_BAD_REQUEST);
        }

        $group->addUser($this->getUser());
        $this->getUser()->addGroup($group);
        $this->em->persist($this->getUser());
        $this->em->persist($group);

        // Notify users of the group
        foreach ($group->getUsers() as $u) {
            if ($u->getId() != $this->getUser()->getId()) {
                $notif = new Notification();
                $notif->setTarget($group->getId());
                $notif->setOwner($u);
                $notif->setFromUser($this->getUser());
                $notif->setFromGroup($group);
                $notif->setType(Notification::USER_JOINED_GROUP);
                $this->em->persist($notif);
            }
        }

        $this->em->flush();

        return new JsonResponse(['id' => $group->getId()], Response::HTTP_OK);
    }
}
