<?php

namespace App\Controller\User;

use App\Controller\ApiController;
use App\Entity\User;
use App\Entity\File;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\ExpressionLanguage\Expression;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Nelmio\ApiDocBundle\Annotation\Model;
use Nelmio\ApiDocBundle\Annotation\Security;
use OpenApi\Annotations as OA;

class Edit extends ApiController
{
    private $encoder;

    public function __construct(
        EntityManagerInterface $em,
        UserPasswordEncoderInterface $encoder,
        SerializerInterface $serializer
    ) {
        parent::__construct($em, $serializer);
        $this->encoder = $encoder;
    }

    /**
     * @Route("/bookmarks/{id}", methods={"POST"})
     * @OA\Response(
     *  response=200,
     *  description="Register a bookmark",
     *  @Model(type=App\Entity\User::class, groups={"read_user"})
     * )
     * @OA\Tag(name="user")
     * @Security(name="api_key")
     */
    public function post_bookmark(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $user = $this->getUser();
        $data = $user->getData();
        if (!isset($data['bookmarks'])) {
            $data['bookmarks'] = [];
        }
        $data['bookmarks'] = array_values(array_merge($data['bookmarks'], [$id]));
        $user->setData($data);

        $user->setLastActivityDate(time());
        $this->em->persist($user);
        $this->em->flush();

        return new Response(
            $this->serialize($user, ['read_user']),
            Response::HTTP_OK
        );
    }

    /**
     * @Route("/bookmarks/{id}", methods={"DELETE"})
     * @OA\Response(
     *  response=200,
     *  description="Unregister a bookmark",
     *  @Model(type=App\Entity\User::class, groups={"read_user"})
     * )
     * @OA\Tag(name="user")
     * @Security(name="api_key")
     */
    public function delete_bookmark(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $user = $this->getUser();
        $data = $user->getData();
        $data['bookmarks'] = array_values(
            array_filter(
                $data['bookmarks'],
                function ($e) use ($id) {
                    return $e != $id;
                }
            )
        );
        $user->setData($data);

        $user->setLastActivityDate(time());
        $this->em->persist($user);
        $this->em->flush();

        return new Response(
            $this->serialize($user, ['read_user']),
            Response::HTTP_OK
        );
    }

    /**
     * @Route("/users/{id}", methods={"PUT"})
     * @OA\RequestBody(
     *  @OA\Schema(
     *    type="object",
     *    @OA\Property(
     *      property="password",
     *      type="string",
     *      description="New password",
     *    ),
     *    @OA\Property(
     *      property="name",
     *      type="string",
     *      description="New name",
     *    ),
     *    @OA\Property(
     *      property="login",
     *      type="string",
     *      description="New login",
     *    ),
     *    @OA\Property(
     *      property="data",
     *      type="object",
     *      description="New data",
     *    ),
     *    @OA\Property(
     *      property="avatar",
     *      type="string",
     *      description="New avatar",
     *    ),
     *  )
     * )
     * @OA\Response(
     *  response=200,
     *  description="Modify a user",
     *  @Model(type=App\Entity\User::class, groups={"read_user"})
     * )
     * @OA\Tag(name="user")
     * @Security(name="api_key")
     */
    public function index(string $id, Request $request): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $user = $this->em->getRepository(User::class)->findOneById($id);
        if (empty($user)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user == object'), $user);

        $requestData = json_decode($request->getcontent(), true);
        if (!empty($requestData['password'])) {
            $user->setPassword($this->encoder->encodePassword($user, $requestData['password']));
        }
        if (!empty($requestData['name'])) {
            $user->setName($requestData['name']);
        }
        if (!empty($requestData['login'])) {
            $duplicate = $this->em->getRepository(User::class)->findOneByLogin($requestData['login']);
            if (empty($duplicate) || $duplicate->getId() === $user->getId()) {
                $user->setLogin($requestData['login']);
            } else {
                return new JsonResponse(['error' => 'User with this login already exists'], Response::HTTP_CONFLICT);
            }
        }
        if (!empty($requestData['data'])) {
            $user->setData(array_merge($user->getData(), $requestData['data']));
        }
        if (!empty($requestData['avatar'])) {
            $file = $this->em->getRepository(File::class)->findOneById($requestData['avatar']);
            if (empty($file)) {
                return new JsonResponse(['error' => 'File Not Found'], Response::HTTP_NOT_FOUND);
            }
            $user->setAvatar($file);
        }
        $this->getUser()->setLastActivityDate(time());
        $this->em->persist($this->getUser());
        $this->em->persist($user);
        $this->em->flush();

        return new Response(
            $this->serialize($user, ['read_user']),
            Response::HTTP_OK
        );
    }

    /**
     * @Route("/users/{id}/reset-api-key", methods={"POST"})
     * @OA\Response(
     *  response=200,
     *  description="Reset a user api key",
     *  @OA\JsonContent(type="string")
     * )
     * @OA\Tag(name="user")
     * @Security(name="api_key")
     */
    public function resetApiKey(string $id): Response
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        $user = $this->em->getRepository(User::class)->findOneById($id);
        if (empty($user)) {
            return new JsonResponse(['error' => 'Not Found'], Response::HTTP_NOT_FOUND);
        }

        $this->denyAccessUnlessGranted(new Expression('user == object'), $user);

        $user->resetSecretKey();

        $this->getUser()->setLastActivityDate(time());
        $this->em->persist($this->getUser());
        $this->em->persist($user);
        $this->em->flush();

        return new JsonResponse(['apiKey' => $user->getSecretKey()], JsonResponse::HTTP_OK);
    }
}
