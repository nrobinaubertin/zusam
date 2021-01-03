<?php

namespace App\Entity;

use App\Service\Uuid;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Nelmio\ApiDocBundle\Annotation\Model;
use OpenApi\Annotations as OA;

/**
 * @ORM\Table(name="`user`")
 * @ORM\Entity()
 */
class User implements UserInterface, \Serializable
{
    /**
     * @ORM\Id
     * @ORM\Column(type="guid")
     * @Groups("*")
     * @Assert\NotBlank()
     * @OA\Property(type="guid")
     */
    private $id;

    /**
     * @ORM\Column(type="integer")
     * @Assert\Type("integer")
     * @Assert\NotNull()
     * @OA\Property(type="integer")
     */
    private $createdAt;

    /**
     * @ORM\Column(type="string", unique=true)
     * @Groups({"read_me", "write_user"})
     * @Assert\NotBlank()
     * @OA\Property(type="string")
     */
    private $login;

    /**
     * @ORM\Column(type="string")
     * @Groups({"write_user"})
     * @Assert\NotBlank()
     * @OA\Property(type="string")
     */
    private $password;

    /**
     * @ORM\Column(type="guid", unique=true)
     * @Assert\NotBlank()
     * @OA\Property(type="guid")
     */
    private $secretKey;

    /**
     * @ORM\ManyToMany(targetEntity="App\Entity\Group", inversedBy="users")
     * @ORM\JoinTable(name="users_groups")
     * @Groups({"read_me"})
     * @OA\Property(type="array", @OA\Items(type="App\Entity\Group"))
     */
    private $groups;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Message", mappedBy="author")
     * @OA\Property(type="array", @OA\Items(type="App\Entity\Message"))
     */
    private $messages;

    /**
     * @ORM\OneToOne(targetEntity="App\Entity\File")
     * @ORM\JoinColumn(name="avatar_id", referencedColumnName="id")
     * @Groups("*")
     * @OA\Property(type="App\Entity\File")
     */
    private $avatar;

    /**
     * @ORM\Column(type="string")
     * @Groups("*")
     * @Assert\NotBlank()
     * @OA\Property(type="string")
     */
    private $name;

    /**
     * @ORM\Column(type="json", nullable=true)
     * @Groups({"read_me", "read_user", "write_user"})
     * @Assert\NotBlank()
     * @OA\Property(type="object")
     */
    private $data;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Notification", mappedBy="owner")
     * @OA\Property(type="array", @OA\Items(type="App\Entity\Notification"))
     */
    private $notifications;

    /**
     * @ORM\Column(type="integer", nullable=true)
     * @Groups({"read_me"})
     * @Assert\Type("integer")
     * @OA\Property(type="integer")
     */
    private $lastActivityDate;

    /**
     * @Groups("*")
     * @OA\Property(type="string")
     */
    private $entityType;

    public function getEntityType(): string
    {
        return strtolower((new \ReflectionClass($this))->getShortName());
    }

    public function __construct()
    {
        $this->id = Uuid::uuidv4();
        $this->groups = new ArrayCollection();
        $this->messages = new ArrayCollection();
        $this->createdAt = time();
        $this->secretKey = Uuid::uuidv4();
        $this->data = [];
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getCreatedAt(): int
    {
        return $this->createdAt;
    }

    public function setCreatedAt(int $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getLogin(): string
    {
        return $this->login;
    }

    public function setLogin(string $login): void
    {
        $this->login = $login;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): void
    {
        $this->password = $password;
    }

    public function getSecretKey(): string
    {
        return $this->secretKey;
    }

    public function resetSecretKey(): void
    {
        $this->secretKey = Uuid::uuidv4();
    }

    public function getGroups(): Collection
    {
        return $this->groups;
    }

    public function addGroup(Group $group): void
    {
        $this->groups[] = $group;
    }

    public function removeGroup(Group $group): void
    {
        $this->groups->removeElement($group);
    }

    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function addMessage(Message $message): void
    {
        $this->messages[] = $message;
    }

    public function removeMessage(Message $message): void
    {
        $this->messages->removeElement($message);
    }

    public function getAvatar(): ?File
    {
        return $this->avatar;
    }

    public function setAvatar(File $avatar): void
    {
        $this->avatar = $avatar;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = $name;
    }

    public function getData(): ?array
    {
        return $this->data;
    }

    public function setData(array $data): void
    {
        $this->data = $data;
    }

    public function getNotifications(): Collection
    {
        return $this->notifications;
    }

    public function addNotification(Notification $notification): void
    {
        $this->notifications[] = $notification;
    }

    public function removeNotification(Notification $notification): void
    {
        $this->notifications->removeElement($notification);
    }

    public function getLastActivityDate(): int
    {
        return $this->lastActivityDate ?? 0;
    }

    public function setLastActivityDate(?int $lastActivityDate): void
    {
        $this->lastActivityDate = $lastActivityDate ?? 0;
    }

    // necessary for UserInterface
    public function getUsername()
    {
        return $this->login;
    }

    // necessary for UserInterface
    public function getSalt()
    {
        return null;
    }

    // necessary for UserInterface
    public function getRoles()
    {
        return ['ROLE_USER'];
    }

    // necessary for UserInterface
    public function eraseCredentials()
    {
    }

    /** @see \Serializable::serialize() */
    public function serialize()
    {
        return serialize([
            $this->id,
            $this->login,
            $this->password,
        ]);
    }

    /** @see \Serializable::unserialize() */
    public function unserialize($serialized)
    {
        list(
            $this->id,
            $this->login,
            $this->password) = unserialize($serialized, ['allowed_classes' => false]);
    }
}
