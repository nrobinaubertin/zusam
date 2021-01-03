<?php

namespace App\Controller\Group;

use App\Controller\ApiController;
use App\Entity\Group;
use App\Entity\Notification;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Serializer\SerializerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;

class Edit extends ApiController
{
    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
    }

    /**
     * @Route("/groups/{id}", methods={"PUT"})
     * @OA\RequestBody(
     *  @OA\Schema(
     *    type="object",
     *    @OA\Property(
     *      property="name",
     *      type="string"
     *    ),
     *  )
     * )
     * @OA\Response(
     *  response=200,
     *  description="Modify a group",
     *  @Model(type=App\Entity\Group::class, groups={"read_group"})
     * )
     * @OA\Tag(name="group")
     * @Security(name="api_key")
     */
    public function index(string $id, Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $group = $this->em->getRepository(Group::class)->findOneById($id);
        if (empty($group)) {
            return new JsonResponse(['error' => 'Not Found'], JsonResponse::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $group);

        $requestData = json_decode($request->getcontent(), true);

        if (!empty($requestData['name'])) {
            $previousName = $group->getName();
            $group->setName($requestData['name']);
            $newName = $group->getName();

            if ($newName != $previousName) {
                // create associated notifications
                $author = $this->getUser();
                foreach ($group->getUsers() as $user) {
                    if ($user->getId() != $author->getId()) {
                        $notif = new Notification();
                        $notif->setTarget($group->getId());
                        $notif->setOwner($user);
                        $notif->setFromUser($author);
                        $notif->setFromGroup($group);
                        $notif->setData([
                            "previousGroupName" => $previousName,
                            "newGroupName" => $newName
                        ]);
                        $notif->setType(Notification::GROUP_NAME_CHANGE);
                        $this->em->persist($notif);
                    }
                }
            }
        }

        $this->getUser()->setLastActivityDate(time());
        $this->em->persist($this->getUser());

        $this->em->persist($group);
        $this->em->flush();

        return new Response(
            $this->serialize($group, ['read_group']),
            Response::HTTP_OK
        );
    }
}
