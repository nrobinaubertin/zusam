<?php

namespace App\Controller\Message;

use App\Controller\ApiController;
use App\Entity\File;
use App\Entity\Group;
use App\Entity\Message;
use App\Entity\Notification;
use App\Service\Url as UrlService;
use Doctrine\Common\Collections\ArrayCollection;
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

class Create extends ApiController
{
    private $urlService;

    public function __construct(
        EntityManagerInterface $em,
        SerializerInterface $serializer,
        UrlService $urlService
    ) {
        parent::__construct($em, $serializer);
        $this->urlService = $urlService;
    }

    /**
     * @Route("/messages", methods={"POST"})
     * @OA\RequestBody(
     *  @OA\Schema(
     *    type="object",
     *    @OA\Property(property="text", type="string"),
     *    @OA\Property(property="title", type="string"),
     *    @OA\Property(
     *      property="files",
     *      type="array",
     *      @OA\Items(
     *        type="string",
     *      )
     *    ),
     *  )
     * )
     * @OA\Response(
     *  response=201,
     *  description="Create a message",
     *  @Model(type=App\Entity\Message::class, groups={"read_message"})
     * )
     * @OA\Tag(name="message")
     * @Security(name="api_key")
     */
    public function index(Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');
        $requestData = json_decode($request->getcontent(), true);
        $group = $this->em->getRepository(Group::class)->findOneById($requestData['group']);
        if (empty($group)) {
            return new JsonResponse(['error' => 'Bad Request'], Response::HTTP_BAD_REQUEST);
        }
        $this->denyAccessUnlessGranted(new Expression('user in object.getUsersAsArray()'), $group);

        // Create the message
        $message = new Message();
        $message->setAuthor($this->getUser());
        $message->setGroup($group);

        if (!empty($requestData['createdAt'])) {
            $message->setCreatedAt($requestData['createdAt']);
        }

        if (!empty($requestData['parent'])) {
            $parent = $this->em->getRepository(Message::class)->findOneById($requestData['parent']);
            $message->setIsInFront(false);
        } else {
            $parent = null;
            $message->setIsInFront(true);
        }
        $message->setParent($parent);

        if (!empty($requestData['data'])) {
            $message->setData($requestData['data']);
        }

        if (!empty($requestData['files'])) {
            $message->setFiles(new ArrayCollection(array_map(function ($fid) {
                return $this->em->getRepository(File::class)->findOneById($fid);
            }, $requestData['files'])));
        }

        $message->setPreview($this->genPreview($message));
        $this->em->persist($message);

        // Update tasks
        $parent = $message->getParent();
        $author = $this->getUser();
        foreach ($group->getUsers() as $user) {
            if ($user->getId() != $author->getId()) {
                $notif = new Notification();
                $notif->setTarget($message->getId());
                $notif->setOwner($user);
                $notif->setFromUser($author);
                $notif->setFromGroup($group);
                if (!empty($parent)) {
                    $notif->setFromMessage($parent);
                    $notif->setType(Notification::NEW_COMMENT);
                } else {
                    $notif->setFromMessage($message);
                    $notif->setType(Notification::NEW_MESSAGE);
                }
                $this->em->persist($notif);
            }
        }

        $author->setLastActivityDate(time());
        $group->setLastActivityDate(time());
        $this->em->persist($group);
        $this->em->persist($author);

        if (!empty($parent)) {
            $parent->setLastActivityDate(time());
            $this->em->persist($parent);
        }

        $this->em->flush();

        return new Response(
            $this->serialize($message, ['read_message']),
            Response::HTTP_CREATED
        );
    }

    public function genPreview(Message $message): ?File
    {
        // get preview with files
        if (count($message->getFiles()) > 0) {
            $firstFile = null;
            foreach ($message->getFiles() as $file) {
                if (!$firstFile || $file->getFileIndex() < $firstFile->getFileIndex()) {
                    $firstFile = $file;
                }
            }

            return $firstFile;
        }
        // if no files, search for urls in text
        $urls = $message->getUrls();
        if (count($urls) > 0) {
            return $this->urlService->getLink($urls[0])->getPreview();
        }

        return null;
    }
}
